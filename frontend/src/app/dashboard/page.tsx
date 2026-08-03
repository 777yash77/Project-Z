'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, DollarSign, Users as UsersIcon, BarChart3, TrendingUp, Activity, Filter, Search, Sparkles, PieChart, ShieldAlert, ArrowUpRight, ChevronRight, BarChart2 } from 'lucide-react';
import { fetchEmployees, fetchWorkforceAiAnalytics, getCurrentUserProfile } from './api';
import EmployeeDetailModal from './EmployeeDetailModal';

interface Employee {
  id: number;
  name: string;
  age: number;
  salary: string;
  yearsAtCompany: number;
  performanceRating: number;
  department: string;
  riskScore: number;
  riskLevel: string;
}

export default function ExecutiveDashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [organizationName, setOrganizationName] = useState('Your Organization');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [aiWorkforceReport, setAiWorkforceReport] = useState<string>('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortField, setSortField] = useState<'riskScore' | 'name' | 'salary' | 'yearsAtCompany'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    Promise.all([fetchEmployees(), getCurrentUserProfile(), fetchWorkforceAiAnalytics()])
      .then(([empRes, profileRes, aiRes]) => {
        setEmployees(empRes.data);
        setOrganizationName(profileRes.data.organization || 'Your Organization');
        if (aiRes.data?.aiWorkforceReport) {
          setAiWorkforceReport(aiRes.data.aiWorkforceReport);
        }
      })
      .catch(() => setEmployees([]));
  }, []);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((e) => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = deptFilter === 'All' || e.department.toLowerCase() === deptFilter.toLowerCase();
        const matchesRisk = riskFilter === 'All' || e.riskLevel === riskFilter;
        return matchesSearch && matchesDept && matchesRisk;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (sortField === 'salary') { valA = Number(valA); valB = Number(valB); }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [employees, searchQuery, deptFilter, riskFilter, sortField, sortOrder]);

  // Aggregate metrics
  const totalEmployees = employees.length;
  const highRiskCount = employees.filter((e) => e.riskLevel === 'High').length;
  const mediumRiskCount = employees.filter((e) => e.riskLevel === 'Medium').length;
  const lowRiskCount = employees.filter((e) => e.riskLevel === 'Low').length;
  const avgProb = employees.length ? (employees.reduce((sum, e) => sum + e.riskScore, 0) / employees.length) * 100 : 0;

  // Dept risk mapping
  const deptRiskMap = useMemo(() => {
    const map: Record<string, { total: number; high: number; sumProb: number }> = {};
    employees.forEach((e) => {
      const dept = e.department || 'General';
      if (!map[dept]) map[dept] = { total: 0, high: 0, sumProb: 0 };
      map[dept].total += 1;
      if (e.riskLevel === 'High') map[dept].high += 1;
      map[dept].sumProb += e.riskScore;
    });
    return Object.entries(map).map(([dept, data]) => ({
      dept,
      count: data.total,
      highCount: data.high,
      avgProb: Math.round((data.sumProb / data.total) * 100),
    }));
  }, [employees]);

  const highestRiskDept = useMemo(() => {
    if (!deptRiskMap.length) return 'N/A';
    return [...deptRiskMap].sort((a, b) => b.avgProb - a.avgProb)[0]?.dept || 'N/A';
  }, [deptRiskMap]);

  const departmentsList = useMemo(() => ['All', ...Array.from(new Set(employees.map((e) => e.department)))], [employees]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Header */}
      <header className="rounded-3xl border p-6 sm:p-8" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em]" style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent)' }}>
                Executive Intelligence
              </span>
              <span className="text-xs text-green-100/30">AI Attrition Command</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{organizationName} Workforce Overview</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-green-100/40">
              Real-time predictive analytics, SHAP Explainable AI factors, Gemini HR Copilot insights, and Stock Watchlist-style employee risk monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border px-4 py-3 text-center" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-green-100/30">Avg Attrition Prob.</p>
              <p className="mt-1 text-2xl font-bold text-white">{avgProb.toFixed(1)}%</p>
            </div>
            <div className="rounded-2xl border px-4 py-3 text-center" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-green-100/30">High Risk Dept</p>
              <p className="mt-1 text-2xl font-bold text-red-400">{highestRiskDept}</p>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Workforce', value: totalEmployees, sub: 'Active profiles', color: 'text-white', border: 'var(--border-subtle)' },
          { label: 'High Attrition Risk', value: highRiskCount, sub: `${Math.round((highRiskCount / Math.max(1, totalEmployees)) * 100)}% of workforce`, color: 'text-red-400', border: 'rgba(220,38,38,0.25)' },
          { label: 'Medium Risk', value: mediumRiskCount, sub: `${Math.round((mediumRiskCount / Math.max(1, totalEmployees)) * 100)}% of workforce`, color: 'text-amber-400', border: 'rgba(217,119,6,0.25)' },
          { label: 'Low Risk / Stable', value: lowRiskCount, sub: `${Math.round((lowRiskCount / Math.max(1, totalEmployees)) * 100)}% of workforce`, color: 'text-green-400', border: 'var(--border-subtle)' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border p-5 transition hover:shadow-lg" style={{ borderColor: stat.border, backgroundColor: 'var(--bg-surface)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-100/30">{stat.label}</p>
            <p className={`mt-3 text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1.5 text-xs text-green-100/30">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Analytics & Gemini Copilot Row */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        
        {/* Department Risk Breakdown */}
        <section className="rounded-3xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-green-400" />
                Department-wise Risk Concentration
              </h2>
              <p className="mt-0.5 text-xs text-green-100/30">Average predicted flight probability per department</p>
            </div>
            <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent)' }}>
              Live
            </span>
          </div>

          <div className="space-y-4">
            {deptRiskMap.map((d) => (
              <div key={d.dept} className="rounded-2xl border p-4 backdrop-blur-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{d.dept} ({d.count} staff)</span>
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 font-semibold">{d.highCount} High Risk</span>
                    <span className="font-mono font-bold text-white">{d.avgProb}% Avg Risk</span>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/40">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      d.avgProb >= 60 ? 'bg-red-500' : d.avgProb >= 40 ? 'bg-amber-400' : 'bg-green-500'
                    }`}
                    style={{ width: `${d.avgProb}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Executive Summary Panel */}
        <section className="rounded-3xl border border-emerald-500/20 bg-card p-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4 mb-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Sparkles size={18} />
              <h2 className="text-base font-extrabold uppercase tracking-widest text-foreground">Gemini AI Executive Workforce Strategy</h2>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">
              Gemini 1.5 Flash
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-500/15 bg-background/60 p-5 text-xs">
            {aiWorkforceReport ? (
              <div className="prose prose-invert max-w-none text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {aiWorkforceReport}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-foreground text-sm">Key Organizational Insights</p>
                  <p className="mt-2 text-muted leading-relaxed">
                    {highestRiskDept !== 'N/A'
                      ? `${highestRiskDept} department exhibits the highest risk density. Top contributing flight drivers are promotion delays (>3 years), salary gaps against market median, and overtime load.`
                      : 'Workforce risk levels are within stable parameters across departments.'}
                  </p>
                </div>

                <div className="h-px w-full bg-emerald-500/15" />

                <div className="space-y-2">
                  <p className="font-bold text-foreground">Recommended Executive Actions</p>
                  {[
                    'Execute targeted stay-interviews for High Risk employees.',
                    'Initiate 12-month promotion ladder review in Sales & Tech.',
                    'Audit overtime load and evaluate work-life balance feedback.',
                  ].map((rec) => (
                    <div key={rec} className="flex items-start gap-2 text-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Stock Watchlist Style Employee Risk Monitor */}
      <section className="rounded-3xl border p-6 sm:p-8" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ShieldAlert size={20} className="text-green-400" />
              Employee Risk Monitor Watchlist
            </h2>
            <p className="mt-1 text-xs text-green-100/40">Stock-market style watchlist — Click any row to view Explainable AI (XAI) factors & What-If simulator.</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all shadow-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
              <Search size={14} className="text-green-400" />
              <input
                type="text"
                placeholder="Search name or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-36 sm:w-48"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all shadow-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
              <Filter size={14} className="text-green-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-transparent outline-none cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{d} Dept</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all shadow-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-transparent outline-none cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                <option value="All" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>All Risks</option>
                <option value="High" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>High Risk</option>
                <option value="Medium" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Medium Risk</option>
                <option value="Low" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Low Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Watchlist Table */}
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-black/40 text-[10px] font-bold uppercase tracking-[0.2em] text-green-100/40" style={{ borderColor: 'var(--border-subtle)' }}>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Employee Name</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Salary</th>
                <th className="px-5 py-4">Performance</th>
                <th className="px-5 py-4">Attrition Prob.</th>
                <th className="px-5 py-4">Risk Level</th>
                <th className="px-5 py-4">Timeline</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {filteredEmployees.map((emp) => {
                const prob = Math.round(emp.riskScore * 100);
                return (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className="group cursor-pointer transition hover:bg-green-500/5"
                  >
                    <td className="px-5 py-4 font-mono text-green-100/40">#{emp.id}</td>
                    <td className="px-5 py-4 font-bold text-white group-hover:text-green-400 transition">{emp.name}</td>
                    <td className="px-5 py-4 text-green-100/60">{emp.department}</td>
                    <td className="px-5 py-4 font-mono text-green-100/60">${Number(emp.salary).toLocaleString()}</td>
                    <td className="px-5 py-4 font-semibold text-white">{emp.performanceRating} / 5.0</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white w-9">{prob}%</span>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/40">
                          <div
                            className={`h-full rounded-full ${emp.riskLevel === 'High' ? 'bg-red-500' : emp.riskLevel === 'Medium' ? 'bg-amber-400' : 'bg-green-500'}`}
                            style={{ width: `${prob}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                        emp.riskLevel === 'High'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : emp.riskLevel === 'Medium'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-green-500/15 text-green-400 border border-green-500/30'
                      }`}>
                        {emp.riskLevel}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-green-100/50 font-medium">
                      {emp.riskLevel === 'High' ? '1–3 Months' : emp.riskLevel === 'Medium' ? '3–6 Months' : '> 1 Year'}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedEmployeeId(emp.id); }}
                        className="inline-flex items-center gap-1 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1 text-[11px] font-bold text-green-400 transition hover:bg-green-500/20"
                      >
                        Inspect <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-xs text-green-100/30">
                    No employee records match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detail & Simulator Modal */}
      {selectedEmployeeId && (
        <EmployeeDetailModal
          employeeId={selectedEmployeeId}
          onClose={() => setSelectedEmployeeId(null)}
        />
      )}
    </div>
  );
}
