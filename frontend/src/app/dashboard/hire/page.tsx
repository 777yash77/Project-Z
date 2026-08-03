'use client';

import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Sparkles, ArrowUpRight, Building2, MessageCircleMore } from 'lucide-react';
import { fetchTradeListings } from '../api';

interface TradeListingItem {
  id: number;
  employee: { id: number; name: string; department: string; riskLevel: string; riskScore: number };
  organization: { name: string };
  commissionPercent: string;
  notes: string;
  status: string;
}

export default function HireWindowPage() {
  const [employees, setEmployees] = useState<TradeListingItem[]>([]);

  useEffect(() => {
    fetchTradeListings().then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  const openProfiles = useMemo(() => employees.filter((e) => e.status === 'OPEN'), [employees]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border border-green-500/12 bg-[#060e09] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400/50">Hire View</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Candidates for Hiring</h1>
            <p className="mt-1 text-sm text-green-100/35">HR teams can review profiles open for trade and scout talent for partner organizations.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-green-500/15 bg-green-500/8 px-4 py-2.5">
            <Sparkles size={15} className="text-green-400" />
            <span className="text-sm font-semibold text-green-300">{openProfiles.length}</span>
            <span className="text-sm text-green-100/40">ready to review</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {openProfiles.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {openProfiles.map((employee) => (
            <div key={employee.id} className="group rounded-2xl border border-green-500/10 bg-[#060e09] p-5 transition hover:border-green-500/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-base font-bold text-green-400">
                  {employee.employee.name.charAt(0)}
                </div>
                <span className="rounded-full border border-green-500/15 bg-green-500/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-green-400">
                  Hire-ready
                </span>
              </div>

              {/* Name & dept */}
              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-green-100/30">{employee.employee.department}</p>
                <h2 className="mt-1 text-xl font-bold text-white">{employee.employee.name}</h2>
              </div>

              {/* Stats */}
              <div className="mt-5 rounded-xl border border-green-500/8 bg-black/30 p-3 text-xs">
                {[
                  { label: 'Risk Level', value: employee.employee.riskLevel, accent: employee.employee.riskLevel === 'High' ? 'text-red-400' : employee.employee.riskLevel === 'Medium' ? 'text-amber-400' : 'text-green-400' },
                  { label: 'Risk Score', value: employee.employee.riskScore.toFixed(2), accent: 'text-white' },
                  { label: 'Commission', value: `${employee.commissionPercent}%`, accent: 'text-green-400' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-green-500/5 last:border-0">
                    <span className="text-green-100/30">{row.label}</span>
                    <span className={`font-semibold ${row.accent}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Organization */}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-green-100/25">
                <Building2 size={11} />
                Listed by {employee.organization.name}
              </div>

              {/* CTA buttons */}
              <div className="mt-4 flex items-center gap-2">
                {employee.listedBy?.id && (
                  <a
                    href={`/dashboard/messages?recipientId=${employee.listedBy.id}`}
                    className="flex items-center gap-1.5 rounded-xl border border-green-500/20 bg-green-500/8 px-3 py-2.5 text-xs font-bold text-green-400 transition hover:bg-green-500/15"
                  >
                    <MessageCircleMore size={14} />
                  </a>
                )}
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-green-500/15 bg-green-500/8 px-4 py-2.5 text-xs font-bold text-green-400 transition group-hover:bg-green-500/12 hover:shadow-[0_0_12px_rgba(0,255,136,0.15)]">
                  <BriefcaseBusiness size={14} />
                  Review Candidate
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-green-500/10 bg-[#060e09] py-20 text-center">
          <BriefcaseBusiness size={36} className="mx-auto mb-4 text-green-500/20" />
          <p className="text-sm text-green-100/20">No hire-ready profiles yet.</p>
          <p className="mt-1 text-xs text-green-100/15">Open employees for trade from the Employee Directory.</p>
        </div>
      )}
    </div>
  );
}
