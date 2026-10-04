import React from 'react';
import { ArrowDownCircle, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#05070b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <div className="w-6 h-6 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ArrowDownCircle className="w-4 h-4" />
            </div>
            <span>Linkora</span>
          </div>
          <span className="hidden sm:inline text-neutral-600">·</span>
          <p className="text-xs text-neutral-400">
            Ephemeral web media stream inspector and universal downloader.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400">
          <a href="#downloader" className="hover:text-white transition-colors">
            Downloader
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#supported-platforms" className="hover:text-white transition-colors">
            Supported Platforms
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
          <button
            onClick={onOpenPrivacy}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            onClick={onOpenTerms}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Terms of Service
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
        <p>© 2026 Linkora. All rights reserved. Built for public & Creative Commons media.</p>
        <div className="flex items-center gap-1.5 text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>No permanent storage · Encrypted streaming</span>
        </div>
      </div>
    </footer>
  );
};
