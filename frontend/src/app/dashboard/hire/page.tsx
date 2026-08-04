'use client';

import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Sparkles, ArrowUpRight, Building2, MessageCircleMore } from 'lucide-react';
import { fetchTradeListings } from '../api';

interface TradeListingItem {
  id: number;
  employee: { id: number; name: string; department: string; riskLevel: string; riskScore: number };
  organization: { name: string };
  listedBy?: { id: number; username: string };
  commissionPercent: string;
  notes: string;
  status: string;
}

export default function HireWindowPage() {
  const [employees, setEmployees] = useState<TradeListingItem[]>([]);

  useEffect(() => {
    fetchTradeListings().then((res) => setEmployees(Array.isArray(res?.data) ? res.data : [])).catch(() => setEmployees([]));
  }, []);

  const openProfiles = useMemo(() => employees.filter((e) => e.status === 'OPEN'), [employees]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Hire View</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Candidates for Hiring</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>HR teams can review profiles open for trade and scout talent for partner organizations.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
            <Sparkles size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{openProfiles.length}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>ready to review</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {openProfiles.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {openProfiles.map((employee) => (
            <div key={employee.id} className="group rounded-2xl border p-5 transition hover:shadow-lg" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-base" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}>
                  {employee.employee.name.charAt(0)}
                </div>
                <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}>
                  Hire-ready
                </span>
              </div>

              {/* Name & dept */}
              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>{employee.employee.department}</p>
                <h2 className="mt-1 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{employee.employee.name}</h2>
              </div>

              {/* Stats */}
              <div className="mt-5 rounded-xl border p-3 text-xs" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                {[
                  { label: 'Risk Level', value: employee.employee.riskLevel, color: employee.employee.riskLevel === 'High' ? '#ef4444' : employee.employee.riskLevel === 'Medium' ? '#f59e0b' : 'var(--accent)' },
                  { label: 'Risk Score', value: employee.employee.riskScore.toFixed(2), color: 'var(--text-primary)' },
                  { label: 'Commission', value: `${employee.commissionPercent}%`, color: 'var(--accent)' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span className="font-semibold" style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Organization */}
              <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Building2 size={11} />
                Listed by {employee.organization.name}
              </div>

              {/* CTA buttons */}
              <div className="mt-4 flex items-center gap-2">
                {employee.listedBy?.id && (
                  <a
                    href={`/dashboard/messages?recipientId=${employee.listedBy.id}`}
                    className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition hover:opacity-90"
                    style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}
                  >
                    <MessageCircleMore size={14} />
                  </a>
                )}
                <button
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition hover:opacity-90"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}
                >
                  <BriefcaseBusiness size={14} />
                  Review Candidate
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed py-20 text-center" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
          <BriefcaseBusiness size={36} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No hire-ready profiles yet.</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Open employees for trade from the Employee Directory.</p>
        </div>
      )}
    </div>
  );
}
