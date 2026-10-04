/**
 * Linkora Full-Stack Entry Point
 * Express API server with Vite middleware integration.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRateLimiter, validateTargetUrl } from './src/server/security.ts';
import { inspectMediaUrl } from './src/server/inspector.ts';
import { handleMediaDownload } from './src/server/streamer.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Body parsing with size boundaries
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiters
const inspectLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 45,
  message: 'Too many inspection requests from this IP. Please wait a minute before analyzing more links.',
});

const downloadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Download rate limit reached. Please wait a minute before requesting additional media streams.',
});

// API Routes

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Linkora',
    version: '1.0.0',
    mode: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// 2. Supported platforms directory & sample test links
app.get('/api/platforms', (req: Request, res: Response) => {
  res.json({
    success: true,
    platforms: [
      {
        id: 'direct',
        name: 'Direct Media URLs',
        description: 'Direct links ending in .mp4, .webm, .mov, .mp3, .m4a, .wav, or CDN files.',
        features: ['Full 1080p/4K master extraction', 'High-bitrate audio stems', 'Instant streaming'],
        supported: true,
        sampleUrl: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
        sampleTitle: 'Blue Moon Trailer (HD MP4)',
      },
      {
        id: 'vimeo',
        name: 'Vimeo',
        description: 'Public Vimeo video URLs with full 1080p, 720p, and MP3 audio stem detection.',
        features: ['1080p Full HD', '720p HD', 'MP3 320kbps Audio'],
        supported: true,
        sampleUrl: 'https://vimeo.com/76979871',
        sampleTitle: 'The New Normal (Vimeo Short)',
      },
      {
        id: 'soundcloud',
        name: 'SoundCloud',
        description: 'Public audio tracks and podcasts on SoundCloud with studio audio quality.',
        features: ['320 kbps MP3', '256 kbps M4A', 'Metadata & Artwork'],
        supported: true,
        sampleUrl: 'https://soundcloud.com/forss/flickermood',
        sampleTitle: 'Forss - Flickermood (Public Track)',
      },
      {
        id: 'youtube',
        name: 'YouTube & Shorts',
        description: 'Public videos, Creative Commons clips, and audio tracks.',
        features: ['1080p Video', '720p Video', 'High-quality MP3 Audio'],
        supported: true,
        sampleUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
        sampleTitle: 'Big Buck Bunny (YouTube Public)',
      },
      {
        id: 'wikimedia',
        name: 'Wikimedia Commons',
        description: 'Educational, open-access, and public domain multimedia files.',
        features: ['Archival WebM/MP4', 'Original quality', 'CC0 & Public Domain'],
        supported: true,
        sampleUrl: 'https://commons.wikimedia.org/wiki/File:Apollo_11_launch_clip.webm',
        sampleTitle: 'Apollo 11 Launch (Wikimedia Archive)',
      },
      {
        id: 'html5',
        name: 'Open Web & HTML5 Sites',
        description: 'Public blogs, news portals, and portfolio sites with standard HTML5 video/audio.',
        features: ['OpenGraph discovery', 'HTML5 <video>/<audio>', 'Twitter Player Cards'],
        supported: true,
        sampleUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        sampleTitle: 'SoundHelix Acoustic Audio (Royalty-Free MP3)',
      },
      {
        id: 'drm',
        name: 'Netflix, Spotify & Subscription Services',
        description: 'Commercial DRM-encrypted media or paywalled streaming platforms.',
        features: ['DRM protected', 'Encrypted streams', 'Strictly excluded by policy'],
        supported: false,
        sampleUrl: 'https://www.netflix.com/title/80057281',
        sampleTitle: 'Netflix Stranger Things (DRM Protected - Rejected)',
      },
    ],
  });
});

// 3. Inspect target URL
app.post('/api/inspect', inspectLimiter, async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'A valid target media URL is required.' });
      return;
    }

    const result = await inspectMediaUrl(url);
    res.json({ success: true, media: result });
  } catch (err: any) {
    const statusCode = err.status || (err.code === 'DRM_PROTECTED' ? 403 : 400);
    res.status(statusCode).json({
      success: false,
      code: err.code || 'INSPECTION_FAILED',
      error: err.message || 'Failed to inspect media stream. Please verify the URL.',
    });
  }
});

// 4. Download media stream
app.get('/api/download', downloadLimiter, async (req: Request, res: Response) => {
  try {
    const targetUrl = req.query.url as string;
    const format = (req.query.format as string) || 'original';
    const title = (req.query.title as string) || 'Linkora_Media';

    if (!targetUrl) {
      res.status(400).json({ success: false, error: 'Missing target download URL parameter.' });
      return;
    }

    await handleMediaDownload(targetUrl, format, title, res);
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: `Download failed: ${err.message || 'Internal streaming error'}`,
      });
    }
  }
});

// Vite Middleware Integration or Static Assets
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Express server error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'An unexpected internal error occurred.',
      });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Linkora server listening on http://0.0.0.0:${PORT} [mode: ${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
