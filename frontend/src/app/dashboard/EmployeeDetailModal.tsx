'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, BarChart2, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { fetchEmployeeDetails, simulateRisk } from './api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative my-8 w-full max-w-5xl rounded-3xl p-6 sm:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
        style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent)' }}>
                Employee XAI Intelligence
              </span>
              <span className="text-xs text-green-100/30">ID #{employeeId}</span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-white">{data?.employee?.name || 'Loading Employee...'}</h2>
            <p className="text-xs text-green-100/40">
              {data?.employee?.department} · Age {data?.employee?.age} · {data?.employee?.yearsAtCompany} Yrs Tenure
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl border p-2 text-green-100/40 transition hover:text-white" style={{ borderColor: 'var(--border-subtle)' }}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="animate-spin text-green-400" size={28} />
          </div>
        ) : data ? (
          <div className="mt-6 space-y-6">

            {/* KPI Overview Cards */}
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { label: 'Risk Level', value: data.riskAnalysis.riskLevel, color: data.riskAnalysis.riskLevel === 'High' ? 'text-red-400' : data.riskAnalysis.riskLevel === 'Medium' ? 'text-amber-400' : 'text-green-400' },
                { label: 'Attrition Probability', value: `${Math.round(data.riskAnalysis.attritionProbability * 100)}%`, color: 'text-white' },
                { label: 'Predicted Timeline', value: data.riskAnalysis.timeline || '3–6 Months', color: 'text-green-400' },
                { label: 'Priority HR Score', value: `${data.riskAnalysis.priorityScore}/100`, color: 'text-amber-400' },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border p-4 backdrop-blur-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-green-100/30">{kpi.label}</p>
                  <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">

              {/* Explainable AI (XAI) - SHAP Factors */}
              <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart2 size={16} className="text-green-400" />
                    Explainable AI — Top Flight Risk Factors
                  </h3>
                  <span className="text-[10px] text-green-100/30 uppercase tracking-[0.2em]">SHAP Values</span>
                </div>
                <div className="mt-4 space-y-3">
                  {data.riskAnalysis.shapFactors?.map((f: any) => (
                    <div key={f.factor} className="rounded-xl border p-3" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{f.factor}</span>
                        <span className={`font-mono font-bold ${f.direction === 'increase' ? 'text-red-400' : 'text-green-400'}`}>{f.impact}</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                        <div
                          className={`h-full rounded-full ${f.direction === 'increase' ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, Math.abs(parseInt(f.impact)) * 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gemini HR Copilot Panel */}
              <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                <div className="flex items-center gap-2 text-green-400 mb-3">
                  <Sparkles size={16} />
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Gemini HR Copilot</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <p className="font-semibold text-white">Executive Summary</p>
                    <p className="mt-1 text-green-100/50 leading-relaxed">{data.riskAnalysis.geminiCopilot?.executiveSummary}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Root Cause Analysis</p>
                    <p className="mt-1 text-green-100/50 leading-relaxed">{data.riskAnalysis.geminiCopilot?.rootCauseAnalysis}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Immediate HR Actions</p>
                    <ul className="mt-1.5 space-y-1">
                      {data.riskAnalysis.geminiCopilot?.immediateHrActions?.map((act: string) => (
                        <li key={act} className="flex items-center gap-2 text-green-100/60">
                          <CheckCircle2 size={12} className="text-green-400 flex-shrink-0" />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border p-3 text-[11px]" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,135,74,0.06)' }}>
                    <p className="font-semibold text-green-400">{data.riskAnalysis.geminiCopilot?.businessImpact}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* What-If Simulator */}
            <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <RefreshCw size={16} className="text-green-400" />
                    What-If Retention Simulator
                  </h3>
                  <p className="mt-0.5 text-xs text-green-100/30">Adjust compensation, overtime & work-life balance to simulate updated risk probability.</p>
                </div>
                <button
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="rounded-xl bg-green-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-green-400"
                >
                  {simulating ? 'Simulating...' : 'Run Simulation'}
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-[11px] text-green-100/40 font-medium">Proposed Salary ($)</label>
                  <input
                    type="number"
                    step="5000"
                    value={simSalary}
                    onChange={(e) => setSimSalary(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border px-3 py-2 text-xs outline-none"
                    style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-green-100/40 font-medium">Work-Life Balance (1–5)</label>
                  <select
                    value={simWlb}
                    onChange={(e) => setSimWlb(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border px-3 py-2 text-xs outline-none cursor-pointer"
                    style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  >
                    <option value={1} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>1 - Poor</option>
                    <option value={2} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>2 - Fair</option>
                    <option value={3} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>3 - Good</option>
                    <option value={4} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>4 - Excellent</option>
                    <option value={5} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>5 - Outstanding</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-green-100/40 font-medium">Overtime Work</label>
                  <select
                    value={simOvertime ? 'yes' : 'no'}
                    onChange={(e) => setSimOvertime(e.target.value === 'yes')}
                    className="mt-1.5 w-full rounded-xl border px-3 py-2 text-xs outline-none cursor-pointer"
                    style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  >
                    <option value="no" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>No Overtime</option>
                    <option value="yes" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Requires Overtime</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-green-100/40 font-medium">Promotion Delay (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={simPromotionGap}
                    onChange={(e) => setSimPromotionGap(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border px-3 py-2 text-xs outline-none"
                    style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Simulation Result comparison */}
              {simulationResult && (
                <div className="mt-5 flex items-center justify-between rounded-xl border p-4 animate-fade-in" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] text-green-100/30 uppercase tracking-[0.2em]">Baseline Risk</p>
                      <p className="text-xl font-bold text-white">{Math.round(data.riskAnalysis.attritionProbability * 100)}%</p>
                    </div>
                    <ArrowRight size={20} className="text-green-400" />
                    <div>
                      <p className="text-[10px] text-green-100/30 uppercase tracking-[0.2em]">Simulated Risk</p>
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

          </div>
        ) : (
          <p className="py-12 text-center text-sm text-green-100/30">Failed to load employee details.</p>
        )}
      </div>
    </div>
  );
}
