import React, { useState } from 'react';
import { Menu, X, ArrowDownCircle, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onSelectSample: (url: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectSample,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07090e]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <ArrowDownCircle className="w-5 h-5" />
          </div>
          <span>Linkora</span>
        </a>

        {/* Zone 2: Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          <a
            href="#downloader"
            className="hover:text-white transition-colors"
          >
            Downloader
          </a>
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a
            href="#supported-platforms"
            className="hover:text-white transition-colors"
          >
            Supported Platforms
          </a>
          <a
            href="#faq"
            className="hover:text-white transition-colors"
          >
            FAQ
          </a>
          <button
            onClick={onOpenPrivacy}
            className="text-neutral-400 hover:text-white transition-colors text-left"
          >
            Privacy
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => {
              onSelectSample('https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4');
              const el = document.getElementById('downloader');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/40 rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] whitespace-nowrap active:scale-[0.98]"
          >
            Load HD Sample
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-400 hover:text-white focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#090d16] px-4 pt-3 pb-5 space-y-3">
          <a
            href="#downloader"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-300 hover:text-white"
          >
            Downloader
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-300 hover:text-white"
          >
            How It Works
          </a>
          <a
            href="#supported-platforms"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-300 hover:text-white"
          >
            Supported Platforms
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-300 hover:text-white"
          >
            FAQ
          </a>
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPrivacy();
              }}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTerms();
              }}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Terms of Service
            </button>
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onSelectSample('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
              const el = document.getElementById('downloader');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full py-2.5 text-xs font-semibold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-500"
          >
            Load 1080p Public Sample
          </button>
        </div>
      )}
    </header>
  );
};
