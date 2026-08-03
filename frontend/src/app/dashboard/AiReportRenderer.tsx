'use client';

import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';

interface AiReportRendererProps {
  reportText: string;
}

export default function AiReportRenderer({ reportText }: AiReportRendererProps) {
  if (!reportText) return null;

  // Clean raw markdown artifacts
  const lines = reportText.split('\n').map((l) => l.trim()).filter(Boolean);

  const sections: { title: string; items: { label?: string; text: string }[] }[] = [];
  let currentSection: { title: string; items: { label?: string; text: string }[] } | null = null;

  lines.forEach((line) => {
    if (line.startsWith('###') || line.startsWith('##') || line.startsWith('#')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      const rawTitle = line.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '');
      currentSection = { title: rawTitle, items: [] };
    } else {
      if (!currentSection) {
        currentSection = { title: 'Executive Retention Overview', items: [] };
      }

      let text = line.replace(/^-\s*/, '').replace(/^\*\s*/, '');
      let label: string | undefined = undefined;

      // Extract **Label**: Content pattern
      const boldMatch = text.match(/^\*\*(.*?)\*\*:\s*(.*)$/);
      if (boldMatch) {
        label = boldMatch[1];
        text = boldMatch[2];
      } else {
        text = text.replace(/\*\*/g, '');
      }

      if (text) {
        currentSection.items.push({ label, text });
      }
    }
  });

  if (currentSection) {
    sections.push(currentSection);
  }

  // Extract top suggested action for the short executive highlight box
  const actionSection = sections.find((s) => s.title.toLowerCase().includes('roadmap') || s.title.toLowerCase().includes('action') || s.title.toLowerCase().includes('intervention'));
  const firstAction = actionSection?.items[0]?.text || sections[0]?.items[0]?.text || 'Execute stay interviews with high-risk employees within 7 business days.';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Short Executive Action Brief Callout Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-black flex-shrink-0 mt-0.5 shadow-md">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">
              AI Suggested Priority Action
            </span>
            <p className="mt-1 text-xs font-bold text-foreground leading-relaxed">
              {firstAction}
            </p>
          </div>
        </div>
      </div>

      {/* Structured Executive Section Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-2xl border border-emerald-500/15 bg-background/80 p-4 shadow-sm hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center gap-2 border-b border-emerald-500/10 pb-2.5 mb-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-[10px] font-extrabold text-emerald-500">
                {idx + 1}
              </span>
              <h4 className="text-xs font-extrabold text-foreground tracking-wide">
                {section.title}
              </h4>
            </div>

            <div className="space-y-2.5 flex-1">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed text-muted">
                    {item.label && (
                      <span className="font-bold text-foreground mr-1.5">
                        {item.label}:
                      </span>
                    )}
                    <span>{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
