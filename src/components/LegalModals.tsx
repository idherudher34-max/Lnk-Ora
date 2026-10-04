import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalsProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0c101a] border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' ? (
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            ) : (
              <FileText className="w-5 h-5 text-blue-400" />
            )}
            <h3 className="text-base sm:text-lg font-bold text-white">
              {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p>
                <strong>Last Updated: October 2026</strong>
              </p>
              <h4 className="text-white font-semibold text-sm">1. Zero Persistent Media Storage</h4>
              <p>
                Linkora operates on a 100% ephemeral in-memory proxy model. When you initiate an inspection or download, media bytes are buffered strictly in temporary RAM and piped directly to your client browser. No video, audio, or metadata files are saved to permanent server hard disks.
              </p>
              <h4 className="text-white font-semibold text-sm">2. No Account or Personal Identifiers</h4>
              <p>
                Linkora requires no user accounts, registration, email addresses, or phone numbers. We do not set persistent advertising tracking cookies or build cross-site tracking profiles.
              </p>
              <h4 className="text-white font-semibold text-sm">3. Temporary Security Logging</h4>
              <p>
                To safeguard infrastructure against distributed denial-of-service (DDoS) attacks, automated brute-force scraping, and malicious SSRF attempts, our web application temporarily checks request IP addresses in volatile memory solely for sliding-window rate limiting. This in-memory counter expires automatically after sixty seconds.
              </p>
              <h4 className="text-white font-semibold text-sm">4. External Web Links</h4>
              <p>
                When inspecting a link, Linkora queries public web addresses provided by the user. Those external third-party servers operate under their respective privacy policies.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Last Updated: October 2026</strong>
              </p>
              <h4 className="text-white font-semibold text-sm">1. Acceptance of Terms</h4>
              <p>
                By accessing or using Linkora, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the application.
              </p>
              <h4 className="text-white font-semibold text-sm">2. Lawful Use & Copyright Responsibility</h4>
              <p>
                Linkora is an analysis and format inspection tool intended for personal backup, offline research, and access to public domain or Creative Commons media. You agree not to use Linkora to infringe upon copyright, trademarks, or proprietary rights of any third party. You are solely responsible for ensuring you hold legal authorization to access and download any target media.
              </p>
              <h4 className="text-white font-semibold text-sm">3. Prohibited Conduct & DRM Protection</h4>
              <p>
                You explicitly agree NOT to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Attempt to bypass Digital Rights Management (DRM) or access paywalled media.</li>
                <li>Conduct Server-Side Request Forgery (SSRF) against internal network infrastructure.</li>
                <li>Submit abusive automated requests designed to saturate or overwhelm service capacity.</li>
              </ul>
              <h4 className="text-white font-semibold text-sm">4. Disclaimer of Warranties</h4>
              <p>
                Linkora is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied. The developers do not guarantee that third-party media streams will remain permanently reachable or compatible with any specific client device.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#090d16] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
