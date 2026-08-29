'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface AiReportRendererProps {
  reportText: string;
}

export default function AiReportRenderer({ reportText }: AiReportRendererProps) {
  const [expanded, setExpanded] = useState(false);

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
  const secondAction = actionSection?.items[1]?.text || sections[0]?.items[1]?.text || 'Audit compensation benchmarks against department medians.';

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Brief Executive Highlight Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-black flex-shrink-0 mt-0.5 shadow-sm">
              <Sparkles size={14} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">
                Brief Executive Action Strategy
              </div>
              <div className="mt-0.5 text-xs font-bold text-[color:var(--text-primary)] leading-snug">
                {firstAction}
              </div>
              {secondAction && (
                <div className="mt-1 text-[11px] text-[color:var(--text-muted)] leading-snug">
                  • {secondAction}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 rounded-xl border border-emerald-500/20 bg-[var(--bg-surface)] px-2.5 py-1 text-[10px] font-bold text-emerald-500 hover:bg-emerald-500/10 transition flex-shrink-0"
          >
            <div>{expanded ? 'Hide Details' : 'Full Strategy'}</div>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Expandable Section Breakdown */}
      {expanded && (
        <div className="grid gap-3 sm:grid-cols-2 animate-fade-in pt-1">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-2xl border border-emerald-500/15 bg-[var(--bg-surface)] p-3.5 shadow-xs"
            >
              <div className="flex items-center gap-2 border-b border-emerald-500/10 pb-2 mb-2.5">
                <div className="flex h-4 w-4 items-center justify-center rounded bg-emerald-500/10 text-[9px] font-extrabold text-emerald-500">
                  {idx + 1}
                </div>
                <div className="text-[11px] font-extrabold text-[color:var(--text-primary)] tracking-wide">
                  {section.title}
                </div>
              </div>

              <div className="space-y-2 flex-1">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-1.5 text-[11px]">
                    <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div className="leading-normal text-[color:var(--text-muted)]">
                      {item.label && (
                        <b className="font-bold text-[color:var(--text-primary)] mr-1">
                          {item.label}:
                        </b>
                      )}
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
