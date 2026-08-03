'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, BellRing, ShieldCheck, Eye, MessageCircleMore } from 'lucide-react';
import { claimTradeListing, fetchTradeListings } from '../api';

interface TradeListingItem {
  id: number;
  employee: { id: number; name: string; department: string; riskLevel: string; riskScore: number };
  organization: { name: string };
  commissionPercent: string;
  notes: string;
  status: string;
}

export default function TradeWindowPage() {
  const [employees, setEmployees] = useState<TradeListingItem[]>([]);

  useEffect(() => {
    fetchTradeListings().then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
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
      <div className="rounded-2xl border border-green-500/12 bg-[#060e09] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400/50">Trade Window</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Employee Trade Visibility</h1>
            <p className="mt-1 text-sm text-green-100/35">HR leaders can monitor talent and coordinate cross-team movement.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-green-500/15 bg-green-500/8 px-4 py-2.5">
            <BellRing size={15} className="text-green-400" />
            <span className="text-sm font-semibold text-green-300">{openForTrade.length}</span>
            <span className="text-sm text-green-100/40">profiles open</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Listings */}
        <section className="rounded-2xl border border-green-500/10 bg-[#060e09] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Open Profiles</h2>
              <p className="mt-0.5 text-xs text-green-100/30">All profiles marked available for trade</p>
            </div>
            <span className="rounded-full border border-green-500/15 bg-green-500/8 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-green-400">Shared view</span>
          </div>

          <div className="space-y-3">
            {employees.map((employee) => (
              <div key={employee.id} className="rounded-xl border border-green-500/8 bg-black/30 p-4 transition hover:border-green-500/15">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-semibold text-white">{employee.employee.name}</h3>
                      {employee.status === 'OPEN' ? (
                        <span className="rounded-full bg-green-500/12 px-2 py-0.5 text-[10px] font-semibold text-green-400">Open</span>
                      ) : (
                        <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-green-100/30">Claimed</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-green-100/40">
                      {employee.employee.department} ·{' '}
                      <span className={employee.employee.riskLevel === 'High' ? 'text-red-400' : employee.employee.riskLevel === 'Medium' ? 'text-amber-400' : 'text-green-400'}>
                        {employee.employee.riskLevel} risk
                      </span>{' '}
                      · score {employee.employee.riskScore.toFixed(2)}
                    </p>
                    <p className="mt-1.5 text-xs text-green-100/25">
                      Listed by {employee.organization.name} · {employee.commissionPercent}% commission · {employee.notes || 'No notes'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {employee.listedBy?.id && (
                      <a
                        href={`/dashboard/messages?recipientId=${employee.listedBy.id}`}
                        className="flex items-center gap-1.5 rounded-xl border border-green-500/20 bg-green-500/8 px-3 py-2 text-xs font-semibold text-green-400 transition hover:bg-green-500/15"
                      >
                        <MessageCircleMore size={14} /> Message HR
                      </a>
                    )}
                    <button
                      onClick={() => claimListing(employee.id)}
                      disabled={employee.status !== 'OPEN'}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                        employee.status === 'OPEN'
                          ? 'bg-green-500 text-black hover:bg-green-400 hover:shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                          : 'cursor-not-allowed bg-black/40 text-green-100/20'
                      }`}
                    >
                      {employee.status === 'OPEN' ? 'Claim Listing' : 'Claimed'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <div className="rounded-xl border border-dashed border-green-500/10 py-12 text-center text-sm text-green-100/20">
                No trade listings yet. Open employees from the directory.
              </div>
            )}
          </div>
        </section>

        {/* Sidebar info */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-green-500/10 bg-[#060e09] p-6">
            <div className="flex items-center gap-2 text-green-400">
              <ShieldCheck size={16} />
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">Cross-HR Visibility</p>
            </div>
            <h2 className="mt-3 text-base font-bold text-white">Who can see this</h2>
            <p className="mt-2 text-xs leading-relaxed text-green-100/30">
              Once a profile is marked open for trade, other HR IDs can track the record and coordinate recruiting conversations.
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/10 bg-[#060e09] p-6">
            <div className="flex items-center gap-2 text-green-400">
              <Eye size={16} />
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">Trade Readiness</p>
            </div>
            <ul className="mt-4 space-y-3">
              {[
                'Share current visibility across HR IDs.',
                'Track updates and pending trade requests.',
                'Keep open-status summary in one place.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-green-100/30">
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500/40" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-green-500/10 bg-[#060e09] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-100/30">Open listings</p>
                <p className="mt-1 text-3xl font-bold text-white">{openForTrade.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <ArrowRightLeft size={20} className="text-green-400" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
