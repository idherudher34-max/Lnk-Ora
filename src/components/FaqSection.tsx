import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Do you store or log downloaded files on your servers?',
      answer:
        'No. Linkora utilizes a strictly ephemeral in-memory proxy architecture. When a download begins, media chunks are piped directly to your browser download manager in memory and discarded the instant transmission finishes. No media files or user activity histories are ever written to server disks.',
    },
    {
      question: 'Is Linkora free to use without registration?',
      answer:
        'Yes, Linkora is 100% free with no registration, accounts, or payment requirements. You can inspect public media links, extract formats, and download files immediately.',
    },
    {
      question: 'Can I extract audio only (MP3 / M4A) from videos?',
      answer:
        'Yes. When inspecting video links, Linkora identifies both full-resolution video streams (1080p, 720p, 480p) and dedicated audio tracks (320kbps MP3 and 256kbps M4A), allowing you to save only the sound without unnecessary video bandwidth.',
    },
    {
      question: 'Why are services like Netflix, Spotify, or Disney+ not supported?',
      answer:
        'Commercial streaming services use Digital Rights Management (DRM) encryption protocols such as Widevine and FairPlay alongside subscription authentication paywalls. Linkora strictly respects technical protection measures and copyright law; it only processes publicly accessible, unencrypted web media.',
    },
    {
      question: 'What are the file size and rate limits?',
      answer:
        'To maintain service availability and prevent server saturation, individual media stream transfers are capped at 150MB. We also enforce a client rate limit of 45 inspections and 30 downloads per minute. If you reach this limit, the system will prompt you with a short cooldown period.',
    },
    {
      question: 'Is it legal to download public web videos and audio?',
      answer:
        'Downloading content you own, open-access media, Creative Commons works, and public domain materials for offline personal backup or archival is standard and lawful. Users are responsible for ensuring that their downloads comply with the terms and copyright restrictions of the host site.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.06]">
      <div className="text-center space-y-3 mb-12">
        <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
          Frequently Asked Questions
        </h2>
        <p className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Clear Answers to Common Questions
        </p>
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto text-balance">
          Everything you need to know about formats, privacy, rates, and platform compatibility.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-white/[0.08] bg-[#0c101a] overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-semibold text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/[0.04] pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
