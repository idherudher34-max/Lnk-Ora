import React from 'react';
import { Link, Sliders, ArrowDownCircle, ShieldCheck } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Paste Public URL',
      description:
        'Input any accessible media link from Vimeo, SoundCloud, YouTube, Wikimedia, or direct CDN storage. Linkora validates the URL and protects against SSRF and unauthorized protocols.',
      icon: Link,
    },
    {
      number: '02',
      title: 'Analyze Stream & Codecs',
      description:
        'Our engine retrieves available progressive stream profiles, codec configurations, bitrates, and file sizes without saving anything to server disks.',
      icon: Sliders,
    },
    {
      number: '03',
      title: 'Download Directly to Device',
      description:
        'Select your preferred resolution or audio format. The stream is passed directly through ephemeral in-memory buffering straight to your browser download manager.',
      icon: ArrowDownCircle,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/[0.06]">
      <div className="text-center space-y-3 mb-14">
        <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
          Architecture & Process
        </h2>
        <p className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
          How Linkora Processes Media
        </p>
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto text-balance">
          A client-first, zero-persistence stream architecture designed for speed, privacy, and full format transparency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="p-6 rounded-2xl bg-[#0c101a] border border-white/[0.08] hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-neutral-600">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.05] flex items-center gap-2 text-xs text-neutral-500">
                <ShieldCheck className="w-4 h-4 text-blue-400/80" />
                <span>Zero persistent server storage</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
