'use client';

import { useEffect, useMemo, useState } from 'react';
import { BellRing, ShieldCheck, Eye, ArrowRightLeft, MessageCircleMore } from 'lucide-react';
import { fetchTradeListings, claimTradeListing } from '../api';

interface TradeListingItem {
  id: number;
  employee: { id: number; name: string; department: string; riskLevel: string; riskScore: number };
  organization: { name: string };
  listedBy?: { id: number; username: string };
  commissionPercent: string;
  notes: string;
  status: string;
}

export default function TradeWindowPage() {
  const [employees, setEmployees] = useState<TradeListingItem[]>([]);

  useEffect(() => {
    fetchTradeListings().then((res) => setEmployees(Array.isArray(res?.data) ? res.data : [])).catch(() => setEmployees([]));
  }, []);

  const openForTrade = useMemo(() => employees.filter((e) => e.status === 'OPEN'), [employees]);

  const claimListing = async (id: number) => {
    try {
      await claimTradeListing(id);
      setEmployees((prev) => prev.map((item) => item.id === id ? { ...item, status: 'CLAIMED' } : item));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Trade Window</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Employee Trade Visibility</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>HR leaders can monitor talent and coordinate cross-team movement.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
            <BellRing size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{openForTrade.length}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>profiles open</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Listings */}
        <section className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Open Profiles</h2>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>All profiles marked available for trade</p>
            </div>
            <span className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.25em]" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}>Shared view</span>
          </div>

          <div className="space-y-3">
            {employees.map((employee) => (
              <div key={employee.id} className="rounded-xl border p-4 transition" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{employee.employee.name}</h3>
                      {employee.status === 'OPEN' ? (
                        <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--accent)' }}>Open</span>
                      ) : (
                        <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>Claimed</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {employee.employee.department} ·{' '}
                      <span style={{ color: employee.employee.riskLevel === 'High' ? '#ef4444' : employee.employee.riskLevel === 'Medium' ? '#f59e0b' : 'var(--accent)' }}>
                        {employee.employee.riskLevel} risk
                      </span>{' '}
                      · score {employee.employee.riskScore.toFixed(2)}
                    </p>
                    <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      Listed by {employee.organization.name} · {employee.commissionPercent}% commission · {employee.notes || 'No notes'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {employee.listedBy?.id && (
                      <a
                        href={`/dashboard/messages?recipientId=${employee.listedBy.id}`}
                        className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:opacity-90"
                        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--accent)' }}
                      >
                        <MessageCircleMore size={14} /> Message HR
                      </a>
                    )}
                    <button
                      onClick={() => claimListing(employee.id)}
                      disabled={employee.status !== 'OPEN'}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      {employee.status === 'OPEN' ? 'Claim Listing' : 'Claimed'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <div className="rounded-xl border border-dashed py-12 text-center text-sm" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                No trade listings yet. Open employees from the directory.
              </div>
            )}
          </div>
        </section>

        {/* Sidebar info */}
        <aside className="space-y-4">
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              <ShieldCheck size={16} />
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">Cross-HR Visibility</p>
            </div>
            <h2 className="mt-3 text-base font-bold" style={{ color: 'var(--text-primary)' }}>Who can see this</h2>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Once a profile is marked open for trade, other HR IDs can track the record and coordinate recruiting conversations.
            </p>
          </div>

          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              <Eye size={16} />
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">Trade Readiness</p>
            </div>
            <ul className="mt-4 space-y-3">
              {[
                'Share current visibility across HR IDs.',
                'Track updates and pending trade requests.',
                'Keep open-status summary in one place.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Open listings</p>
                <p className="mt-1 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{openForTrade.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                <ArrowRightLeft size={20} style={{ color: 'var(--accent)' }} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
