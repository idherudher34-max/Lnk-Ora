import React, { useState, useEffect } from 'react';
import {
  Link2,
  Clipboard,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Film,
  Music,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Copy,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { MediaFormat, MediaInspectionResult } from '../types.ts';

interface MediaDownloaderProps {
  externalUrl?: string;
  onClearExternalUrl?: () => void;
  heroImageSrc?: string;
}

export const MediaDownloader: React.FC<MediaDownloaderProps> = ({
  externalUrl,
  onClearExternalUrl,
  heroImageSrc,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{
    code?: string;
    message: string;
    isDrm?: boolean;
  } | null>(null);
  const [mediaData, setMediaData] = useState<MediaInspectionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio'>('all');
  const [downloadingFormatId, setDownloadingFormatId] = useState<string | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Sync external URL passed from sample buttons or navigation
  useEffect(() => {
    if (externalUrl) {
      setInputUrl(externalUrl);
      analyzeUrl(externalUrl);
      if (onClearExternalUrl) {
        onClearExternalUrl();
      }
    }
  }, [externalUrl]);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text.trim());
          setErrorInfo(null);
        }
      } else {
        alert('Clipboard access not permitted by browser. Please paste manually into the input box.');
      }
    } catch {
      // Fallback
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setErrorInfo({ message: 'Please enter or paste a valid web media URL.' });
      return;
    }
    analyzeUrl(inputUrl.trim());
  };

  const analyzeUrl = async (urlToInspect: string) => {
    setIsAnalyzing(true);
    setErrorInfo(null);
    setMediaData(null);
    setDownloadSuccessMessage(null);

    try {
      const response = await fetch('/api/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToInspect }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const isDrm = data.code === 'DRM_PROTECTED' || response.status === 403;
        setErrorInfo({
          code: data.code,
          message: data.error || 'Failed to inspect media stream. Please verify the URL.',
          isDrm,
        });
        return;
      }

      setMediaData(data.media);
      // Auto-set tab based on predominant media format
      const hasVideo = data.media.formats.some((f: MediaFormat) => f.type === 'video');
      setActiveTab(hasVideo ? 'all' : 'audio');
    } catch (err: any) {
      setErrorInfo({
        message: 'Network connection failed while inspecting URL. Please check your connection and retry.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = (format: MediaFormat) => {
    if (!mediaData) return;
    setDownloadingFormatId(format.id);

    // Create programmatic anchor to trigger native stream download
    const link = document.createElement('a');
    link.href = format.downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccessMessage(
      `Downloading ${format.label} (${format.format}). Saved to your default downloads folder.`
    );

    setTimeout(() => {
      setDownloadingFormatId(null);
    }, 2500);

    setTimeout(() => {
      setDownloadSuccessMessage(null);
    }, 6000);
  };

  const copyOriginalLink = () => {
    if (!mediaData?.originalUrl) return;
    navigator.clipboard.writeText(mediaData.originalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Filter formats based on tab
  const filteredFormats = mediaData?.formats.filter((f) => {
    if (activeTab === 'all') return true;
    return f.type === activeTab;
  }) || [];

  return (
    <section id="downloader" className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Hero Headline & Subtitle */}
      <div className="text-center space-y-4 mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 border border-blue-500/20 bg-blue-950/40 rounded-full px-3.5 py-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>High-Definition Media & Audio Stream Inspector</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto text-balance">
          Download & Inspect <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            Public Web Media
          </span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed text-balance">
          Extract high-resolution MP4 video and crystal-clear 320kbps MP3 audio from public web sources.
          Zero accounts, zero trackers, 100% ephemeral in-memory streaming.
        </p>
      </div>

      {/* Main Input Box Container */}
      <div className="relative z-10 bg-[#0d121f] border border-white/[0.09] rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/80 backdrop-blur-xl">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#080b13] border border-white/[0.12] rounded-xl p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <div className="flex items-center flex-1 px-3 py-1 gap-2.5">
              <Link2 className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (errorInfo) setErrorInfo(null);
                }}
                placeholder="Paste public video or audio URL (e.g., https://...)"
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none"
                disabled={isAnalyzing}
                required
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <button
                type="button"
                onClick={handlePaste}
                disabled={isAnalyzing}
                className="px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>

              <button
                type="submit"
                disabled={isAnalyzing || !inputUrl.trim()}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Inspect Media</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Test Samples */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <span className="font-medium text-neutral-300">Try public test sample:</span>
          <button
            type="button"
            onClick={() => {
              const url = 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4';
              setInputUrl(url);
              analyzeUrl(url);
            }}
            className="hover:text-blue-400 underline decoration-neutral-600 hover:decoration-blue-400 transition-colors"
          >
            Blue Moon Trailer (HD MP4)
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              const url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
              setInputUrl(url);
              analyzeUrl(url);
            }}
            className="hover:text-blue-400 underline decoration-neutral-600 hover:decoration-blue-400 transition-colors"
          >
            SoundHelix (Studio MP3)
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              const url = 'https://vimeo.com/76979871';
              setInputUrl(url);
              analyzeUrl(url);
            }}
            className="hover:text-blue-400 underline decoration-neutral-600 hover:decoration-blue-400 transition-colors"
          >
            Vimeo (The New Normal)
          </button>
        </div>

        {/* Loading Progress State */}
        {isAnalyzing && (
          <div className="mt-6 p-6 rounded-xl bg-blue-950/20 border border-blue-500/20 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Inspecting remote media stream...</p>
              <p className="text-xs text-neutral-400">
                Verifying protocol, detecting audio/video containers, and extracting resolution profiles
              </p>
            </div>
          </div>
        )}

        {/* Error / DRM Notice State */}
        {errorInfo && !isAnalyzing && (
          <div
            className={`mt-6 p-4 rounded-xl border flex items-start gap-3.5 ${
              errorInfo.isDrm
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                : 'bg-red-950/30 border-red-500/30 text-red-200'
            }`}
          >
            {errorInfo.isDrm ? (
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-white">
                {errorInfo.isDrm ? 'DRM & Copyright Protection Enforced' : 'Inspection Issue Detected'}
              </p>
              <p className="text-neutral-300 leading-relaxed">{errorInfo.message}</p>
              {errorInfo.isDrm && (
                <p className="text-xs text-amber-300/80 pt-1">
                  Note: Linkora complies with copyright laws and technical protection measures. We do
                  not bypass DRM encryption or authenticated paywalls.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Download Success Banner */}
        {downloadSuccessMessage && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
        )}

        {/* Media Results Card */}
        {mediaData && !isAnalyzing && (
          <div className="mt-8 space-y-6">
            {/* Top Media Header Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#090d16] border border-white/[0.08] flex flex-col md:flex-row gap-5 items-start">
              {/* Thumbnail / Visual Box */}
              <div className="relative w-full md:w-56 h-36 bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-white/[0.06] flex items-center justify-center">
                {mediaData.thumbnailUrl ? (
                  <img
                    src={mediaData.thumbnailUrl}
                    alt={mediaData.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-500 gap-1.5">
                    {mediaData.formats.some((f) => f.type === 'video') ? (
                      <Film className="w-8 h-8 text-neutral-600" />
                    ) : (
                      <Music className="w-8 h-8 text-neutral-600" />
                    )}
                    <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                      {mediaData.platformName}
                    </span>
                  </div>
                )}
                {/* Duration Badge */}
                {mediaData.durationFormatted && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[11px] font-mono text-neutral-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>{mediaData.durationFormatted}</span>
                  </div>
                )}
              </div>

              {/* Title, Platform & Actions */}
              <div className="flex-1 space-y-2.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                    {mediaData.platformName}
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span className="text-xs text-neutral-400">
                    By <strong className="text-neutral-200 font-medium">{mediaData.author}</strong>
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-snug">
                  {mediaData.title}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2">
                  {mediaData.description}
                </p>

                {/* Original Link Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                  <a
                    href={mediaData.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                  >
                    <span>View original source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={copyOriginalLink}
                    className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedUrl ? 'Copied URL!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Format Filter Segmented Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-1 p-1 bg-[#090d16] border border-white/[0.08] rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All Streams ({mediaData.formats.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'video'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Video MP4 ({mediaData.formats.filter((f) => f.type === 'video').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('audio')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'audio'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Audio MP3 / M4A ({mediaData.formats.filter((f) => f.type === 'audio').length})</span>
                </button>
              </div>

              <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>SSL Secured & Virus Scanned Stream</span>
              </div>
            </div>

            {/* Available Formats Grid / Table */}
            <div className="border border-white/[0.08] rounded-xl overflow-hidden divide-y divide-white/[0.06] bg-[#090d16]">
              {filteredFormats.map((format) => (
                <div
                  key={format.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Left Specs */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        format.type === 'video'
                          ? 'bg-blue-950/60 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {format.type === 'video' ? (
                        <Film className="w-4 h-4" />
                      ) : (
                        <Music className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{format.label}</span>
                        <span className="text-[11px] font-mono text-neutral-400 border border-white/[0.08] px-1.5 py-0.5 rounded">
                          {format.format}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 flex items-center gap-2">
                        <span>{format.resolution}</span>
                        <span>·</span>
                        <span>{format.codec}</span>
                        <span>·</span>
                        <span>{format.hasAudio ? 'Audio Included' : 'No Audio'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <span className="text-xs font-mono font-medium text-neutral-300 tabular-nums">
                      {format.size}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDownload(format)}
                      disabled={downloadingFormatId === format.id}
                      className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.25)] active:scale-95 whitespace-nowrap"
                    >
                      {downloadingFormatId === format.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Streaming...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {filteredFormats.length === 0 && (
                <div className="p-8 text-center text-sm text-neutral-500">
                  No formats match the selected filter category.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
