/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { MediaDownloader } from './components/MediaDownloader.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { SupportedPlatforms } from './components/SupportedPlatforms.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { Footer } from './components/Footer.tsx';
import { LegalModals } from './components/LegalModals.tsx';
import heroImage from './assets/images/hero_media_interface_1791103224040.jpg';

export default function App() {
  const [selectedSampleUrl, setSelectedSampleUrl] = useState<string | undefined>(undefined);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  const handleSelectSample = (url: string) => {
    setSelectedSampleUrl(url);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-200">
      {/* Top Bar Contract (3 zones) */}
      <Navbar
        onSelectSample={handleSelectSample}
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Media Downloader & Inspector Engine */}
        <MediaDownloader
          externalUrl={selectedSampleUrl}
          onClearExternalUrl={() => setSelectedSampleUrl(undefined)}
          heroImageSrc={heroImage}
        />

        {/* How It Works */}
        <HowItWorks />

        {/* Supported Platforms Directory & 1-Click Verification */}
        <SupportedPlatforms onSelectSample={handleSelectSample} />

        {/* Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
      />

      {/* Legal Modals */}
      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
