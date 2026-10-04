import React, { useEffect, useState } from 'react';
import {
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  Play,
  FileVideo,
  Music2,
  Globe2,
  HardDrive,
} from 'lucide-react';
import { PlatformInfo } from '../types.ts';

interface SupportedPlatformsProps {
  onSelectSample: (url: string) => void;
}

export const SupportedPlatforms: React.FC<SupportedPlatformsProps> = ({ onSelectSample }) => {
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);

  useEffect(() => {
    fetch('/api/platforms')
      .then((res) => res.json())
      .then((data) => {
        if (data.platforms) setPlatforms(data.platforms);
      })
      .catch(() => {
        // Fallback default
        setPlatforms([
          {
            id: 'direct',
            name: 'Direct Media Files & CDNs',
            description: 'Public URLs ending in .mp4, .webm, .mov, .mp3, .m4a, or hosted on cloud storage.',
            features: ['Original 1080p/4K master', 'Full bitrates', 'Direct browser piping'],
            supported: true,
            sampleUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            sampleTitle: 'Big Buck Bunny (1080p MP4)',
          },
          {
            id: 'vimeo',
            name: 'Vimeo',
            description: 'Public Vimeo video content with adaptive MP4 streams and extracted MP3 audio.',
            features: ['1080p Full HD', '720p HD', 'MP3 320kbps Audio'],
            supported: true,
            sampleUrl: 'https://vimeo.com/76979871',
            sampleTitle: 'The New Normal (Vimeo)',
          },
          {
            id: 'soundcloud',
            name: 'SoundCloud',
            description: 'Public audio tracks, mixes, and podcasts uploaded to SoundCloud.',
            features: ['320 kbps MP3', '256 kbps M4A', 'Artist & Artwork'],
            supported: true,
            sampleUrl: 'https://soundcloud.com/forss/flickermood',
            sampleTitle: 'Forss Flickermood Track',
          },
          {
            id: 'wikimedia',
            name: 'Wikimedia Commons',
            description: 'Open-access educational videos, historical archives, and documentary clips.',
            features: ['Archival WebM/MP4', 'Lossless streams', 'Public Domain'],
            supported: true,
            sampleUrl: 'https://commons.wikimedia.org/wiki/File:Apollo_11_launch_clip.webm',
            sampleTitle: 'Apollo 11 Launch Archive',
          },
          {
            id: 'html5',
            name: 'Open Web & HTML5 Sites',
            description: 'Websites featuring standard HTML5 video/audio tags and OpenGraph video metadata.',
            features: ['OpenGraph discovery', 'HTML5 source tags', 'MP3 conversion'],
            supported: true,
            sampleUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            sampleTitle: 'SoundHelix Acoustic Audio',
          },
          {
            id: 'drm',
            name: 'Subscription Services (Netflix, Spotify, Hulu)',
            description: 'Commercial subscription services that protect media using Widevine/FairPlay DRM.',
            features: ['DRM Encrypted', 'Paywall protected', 'Excluded by policy'],
            supported: false,
          },
        ]);
      });
  }, []);

  const supportedList = platforms.filter((p) => p.supported);
  const unsupportedList = platforms.filter((p) => !p.supported);

  return (
    <section id="supported-platforms" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/[0.06]">
      <div className="text-center space-y-3 mb-14">
        <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
          Platform Directory
        </h2>
        <p className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Supported Platforms & Compatibility
        </p>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto text-balance">
          Linkora accesses publicly accessible audio and video streams. We do not authenticate behind paywalls or bypass digital encryption.
        </p>
      </div>

      {/* Supported Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {supportedList.map((platform) => (
          <div
            key={platform.id}
            className="p-6 rounded-2xl bg-[#0c101a] border border-white/[0.08] flex flex-col justify-between space-y-5 hover:border-blue-500/20 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">{platform.name}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Public Streams</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {platform.description}
              </p>

              <div className="space-y-1.5 pt-2">
                {platform.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {platform.sampleUrl && (
              <div className="pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    onSelectSample(platform.sampleUrl!);
                    const el = document.getElementById('downloader');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2 px-3 text-xs font-medium text-blue-300 hover:text-white bg-blue-950/30 hover:bg-blue-600/30 border border-blue-500/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test with {platform.sampleTitle || 'sample'}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Explicit Unsupported / DRM Banner */}
      <div className="p-6 rounded-2xl bg-[#140c11] border border-red-500/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Excluded: DRM-Protected & Subscription Paywalls
            </h3>
            <p className="text-xs text-neutral-400">
              Strictly prohibited and intentionally blocked by security policy
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Linkora is built for public, open-access media, backups, and Creative Commons content.
          Platforms such as <strong>Netflix, Spotify, Hulu, Disney+, Amazon Prime Video, and Apple Music</strong>{' '}
          employ cryptographic DRM mechanisms (e.g., Widevine, PlayReady, FairPlay) and authenticated session cookies.
          Linkora does not store user account credentials and will reject all requests to encrypted or subscription-locked URLs.
        </p>
      </div>
    </section>
  );
};
