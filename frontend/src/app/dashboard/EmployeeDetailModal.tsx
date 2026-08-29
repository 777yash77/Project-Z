'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, BarChart2, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { fetchEmployeeDetails, simulateRisk } from './api';

import AiReportRenderer from './AiReportRenderer';

interface EmployeeDetailModalProps {
  employeeId: number | null;
  onClose: () => void;
}

export default function EmployeeDetailModal({ employeeId, onClose }: EmployeeDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // What-if simulator state
  const [simSalary, setSimSalary] = useState<number>(80000);
  const [simOvertime, setSimOvertime] = useState<boolean>(false);
  const [simWlb, setSimWlb] = useState<number>(3);
  const [simPromotionGap, setSimPromotionGap] = useState<number>(2);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    fetchEmployeeDetails(employeeId)
      .then((res) => {
        setData(res.data);
        const emp = res.data.employee;
        setSimSalary(Number(emp.salary) || 80000);
        setSimOvertime(false);
        setSimWlb(3);
        setSimPromotionGap(emp.yearsAtCompany > 3 ? 3 : 1);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [employeeId]);

  const handleSimulate = async () => {
    if (!data?.employee) return;
    setSimulating(true);
    try {
      const emp = data.employee;
      const res = await simulateRisk({
        salary: simSalary,
        yearsAtCompany: emp.yearsAtCompany,
        performanceRating: emp.performanceRating,
        age: emp.age,
        department: emp.department,
        overtime: simOvertime,
        workLifeBalance: simWlb,
        promotionGap: simPromotionGap,
      });
      setSimulationResult(res.data);
    } catch {
      /* ignore */
    } finally {
      setSimulating(false);
    }
  };

  if (!employeeId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/20 dark:bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 md:p-12">
        <div
          className="relative w-full max-w-5xl rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] p-6 sm:p-8"
          style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-5" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent)' }}>
                  Employee XAI Intelligence
                </span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>ID #{employeeId}</span>
              </div>
              <h2 className="mt-1 text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{data?.employee?.name || 'Loading Employee...'}</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {data?.employee?.department} · Age {data?.employee?.age} · {data?.employee?.yearsAtCompany} Yrs Tenure
              </p>
            </div>
            <button 
              onClick={onClose}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-sm transition hover:scale-105 hover:bg-red-500/10 hover:text-red-500"
              style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="animate-spin text-green-400" size={28} />
          </div>
        ) : data ? (
          <div className="mt-6 space-y-6">

            {/* KPI Overview Cards */}
            {(() => {
              const activeAnalysis = simulationResult ? {
                riskLevel: simulationResult.riskLevel,
                attritionProbability: simulationResult.retentionRiskScore,
                timeline: simulationResult.riskLevel === 'High' ? '1–3 Months' : simulationResult.riskLevel === 'Medium' ? '3–6 Months' : '> 1 Year',
                priorityScore: Math.round(simulationResult.retentionRiskScore * 100),
                shapFactors: simulationResult.shapFactors,
                fullAiReport: simulationResult.fullAiReport || data.riskAnalysis?.fullAiReport
              } : data.riskAnalysis;

              return (
                <>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Risk Level', value: activeAnalysis.riskLevel, color: activeAnalysis.riskLevel === 'High' ? 'text-red-400' : activeAnalysis.riskLevel === 'Medium' ? 'text-amber-400' : 'text-green-400' },
                      { label: 'Attrition Probability', value: `${Math.round(activeAnalysis.attritionProbability * 100)}%`, color: 'text-[var(--text-primary)]' },
                      { label: 'Predicted Timeline', value: activeAnalysis.timeline || '3–6 Months', color: 'text-green-400' },
                      { label: 'Priority HR Score', value: `${activeAnalysis.priorityScore}/100`, color: 'text-amber-400' },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-2xl border p-4 backdrop-blur-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{kpi.label}</p>
                        <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Gemini HR Copilot Panel */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-card p-6 shadow-md w-full">
                      <div className="flex items-center justify-between border-b border-emerald-500/15 pb-3 mb-4">
                        <div className="flex items-center gap-2 text-emerald-500">
                          <Sparkles size={18} />
                          <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Gemini AI Employee Analytics</h3>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
                          {simulationResult ? 'Simulation Active' : 'Live Analysis'}
                        </span>
                      </div>

                      {activeAnalysis.fullAiReport ? (
                        <AiReportRenderer reportText={activeAnalysis.fullAiReport} />
                      ) : (
                        <div className="space-y-4 text-xs">
                          <div>
                            <p className="font-bold text-foreground">Executive Summary</p>
                            <p className="mt-1 text-muted leading-relaxed">{data.riskAnalysis.geminiCopilot?.executiveSummary}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* What-If Simulator */}
                  <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <RefreshCw size={16} className="text-green-400" />
                          What-If Retention Simulator
                        </h3>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">Adjust compensation, overtime & work-life balance to simulate updated risk probability.</p>
                      </div>
                      <button
                        onClick={handleSimulate}
                        disabled={simulating}
                        className="rounded-xl bg-green-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-green-400"
                      >
                        {simulating ? 'Simulating...' : 'Run Simulation'}
                      </button>
                    </div>

                    <div className="mt-5 grid gap-6 sm:grid-cols-4">
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Proposed Salary</label>
                          <span className="text-xs font-mono font-bold text-green-400">${simSalary.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="30000"
                          max="250000"
                          step="1000"
                          value={simSalary}
                          onChange={(e) => setSimSalary(Number(e.target.value))}
                          className="w-full accent-green-500 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer outline-none"
                        />
                        <div className="flex justify-between text-[9px] text-[var(--text-faint)] mt-1.5">
                          <span>$30k</span>
                          <span>$250k</span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">W-L Balance</label>
                          <span className="text-xs font-bold text-green-400">{simWlb}/5</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={simWlb}
                          onChange={(e) => setSimWlb(Number(e.target.value))}
                          className="w-full accent-green-500 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer outline-none"
                        />
                        <div className="flex justify-between text-[9px] text-[var(--text-faint)] mt-1.5">
                          <span>Poor (1)</span>
                          <span>Outstanding (5)</span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Overtime</label>
                        </div>
                        <select
                          value={simOvertime ? 'yes' : 'no'}
                          onChange={(e) => setSimOvertime(e.target.value === 'yes')}
                          className="w-full rounded-xl border px-3 py-1.5 text-xs font-medium outline-none cursor-pointer transition focus:ring-1 focus:ring-green-500"
                          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                          <option value="no">No Overtime</option>
                          <option value="yes">Requires Overtime</option>
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Promotion Gap</label>
                          <span className="text-xs font-bold text-green-400">{simPromotionGap} Yrs</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={simPromotionGap}
                          onChange={(e) => setSimPromotionGap(Number(e.target.value))}
                          className="w-full accent-green-500 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer outline-none"
                        />
                        <div className="flex justify-between text-[9px] text-[var(--text-faint)] mt-1.5">
                          <span>0 Yrs</span>
                          <span>10 Yrs</span>
                        </div>
                      </div>
                    </div>

                    {/* Simulation Result comparison */}
                    {simulationResult && (
                      <div className="mt-5 flex items-center justify-between rounded-xl border p-4 animate-fade-in" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">Baseline Risk</p>
                            <p className="text-xl font-bold text-[var(--text-primary)]">{Math.round(data.riskAnalysis.attritionProbability * 100)}%</p>
                          </div>
                          <ArrowRight size={20} className="text-green-400" />
                          <div>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">Simulated Risk</p>
                            <p className="text-xl font-bold text-green-400">{Math.round(simulationResult.attritionProbability * 100)}%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                            simulationResult.attritionProbability < data.riskAnalysis.attritionProbability
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}>
                            {simulationResult.attritionProbability < data.riskAnalysis.attritionProbability ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                            {Math.round((simulationResult.attritionProbability - data.riskAnalysis.attritionProbability) * 100)}% Risk Delta
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
          })()}

          </div>
        ) : (
          <p className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Failed to load employee details.</p>
        )}
        </div>
      </div>
    </div>
  );
}
