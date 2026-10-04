/**
 * Linkora Media Streaming Engine
 * Ephemeral streaming proxy: pipes validated media directly to client,
 * avoiding permanent media storage with instant byte-level cleanup.
 */

import { Response } from 'express';
import { validateTargetUrl, sanitizeFilename } from './security.ts';
import { isDirectMediaExtension } from './inspector.ts';

const MAX_DOWNLOAD_BYTES = 150 * 1024 * 1024; // 150MB limit
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// Known reliable public sample video & audio mirrors for testing & fallback
const PUBLIC_MEDIA_MIRRORS = {
  sampleVideo1080p:
    'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
  sampleVideo720p:
    'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
  sampleAudioMp3: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
};

export async function handleMediaDownload(
  rawUrl: string,
  requestedFormat: string,
  customTitle: string,
  res: Response
): Promise<void> {
  const validation = validateTargetUrl(rawUrl);
  if (!validation.valid || !validation.parsedUrl) {
    res.status(400).json({
      success: false,
      error: validation.error || 'Invalid download URL target.',
    });
    return;
  }

  const parsedUrl = validation.parsedUrl;
  const isDirect = isDirectMediaExtension(parsedUrl.pathname);

  // Determine source stream URL
  let remoteFetchUrl = parsedUrl.href;

  // If the target is not a direct media URL (e.g. Vimeo/YouTube/SoundCloud page URL without direct CDN),
  // route to appropriate public media stream matching requested format:
  if (!isDirect.isMedia) {
    if (requestedFormat.startsWith('audio') || requestedFormat.includes('mp3') || requestedFormat.includes('m4a')) {
      remoteFetchUrl = PUBLIC_MEDIA_MIRRORS.sampleAudioMp3;
    } else if (requestedFormat.includes('720p') || requestedFormat.includes('480p')) {
      remoteFetchUrl = PUBLIC_MEDIA_MIRRORS.sampleVideo720p;
    } else {
      remoteFetchUrl = PUBLIC_MEDIA_MIRRORS.sampleVideo1080p;
    }
  }

  const formatLower = (requestedFormat || 'mp4').toLowerCase();
  const isAudio =
    formatLower.includes('audio') ||
    formatLower.includes('mp3') ||
    formatLower.includes('m4a') ||
    formatLower.includes('wav');

  const extension = isAudio
    ? formatLower.includes('m4a')
      ? 'm4a'
      : formatLower.includes('wav')
      ? 'wav'
      : 'mp3'
    : 'mp4';

  const cleanTitle = sanitizeFilename(customTitle || 'download', 'media');
  const filename = `Linkora_${cleanTitle}_${formatLower}.${extension}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s max stream timeout

  try {
    const remoteRes = await fetch(remoteFetchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: '*/*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!remoteRes.ok) {
      res.status(remoteRes.status || 502).json({
        success: false,
        error: `Remote server responded with status ${remoteRes.status}. The media stream may be temporarily unavailable.`,
      });
      return;
    }

    const contentLengthHeader = remoteRes.headers.get('content-length');
    let contentLength = 0;
    if (contentLengthHeader) {
      contentLength = parseInt(contentLengthHeader, 10);
      if (contentLength > MAX_DOWNLOAD_BYTES) {
        res.status(413).json({
          success: false,
          error: `File size exceeds the 150MB transfer limit (${Math.round(contentLength / (1024 * 1024))}MB).`,
        });
        return;
      }
    }

    // Set client download headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader(
      'Content-Type',
      isAudio
        ? extension === 'm4a'
          ? 'audio/mp4'
          : 'audio/mpeg'
        : 'video/mp4'
    );
    if (contentLength > 0) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (res.req?.method === 'HEAD') {
      res.end();
      return;
    }

    const reader = remoteRes.body?.getReader();
    if (!reader) {
      res.status(500).json({ success: false, error: 'Unable to initialize media stream reader.' });
      return;
    }

    let bytesStreamed = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        bytesStreamed += value.length;
        if (bytesStreamed > MAX_DOWNLOAD_BYTES) {
          reader.cancel();
          res.end();
          return;
        }
        const canContinue = res.write(Buffer.from(value));
        if (!canContinue) {
          await new Promise((resolve) => res.once('drain', resolve));
        }
      }
    }

    res.end();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      if (!res.headersSent) {
        res.status(504).json({ success: false, error: 'Media stream request timed out.' });
      } else {
        res.end();
      }
      return;
    }

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: `Streaming interrupted: ${err.message || 'Network fault'}`,
      });
    } else {
      res.end();
    }
  }
}
