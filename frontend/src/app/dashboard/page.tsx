'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { AlertTriangle, DollarSign, Users as UsersIcon, BarChart3, TrendingUp, Activity, Filter, Search, Sparkles, PieChart, ShieldAlert, ArrowUpRight, ChevronRight, BarChart2 } from 'lucide-react';
import { fetchEmployees, fetchWorkforceAiAnalytics, getMe } from './api';
import EmployeeDetailModal from './EmployeeDetailModal';
import { ComposedChart, Area, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import AiReportRenderer from './AiReportRenderer';

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
  const [role, setRole] = useState<string | null>(null);
  const [flashStates, setFlashStates] = useState<Record<number, 'up' | 'down'>>({});
  const [riskHistory, setRiskHistory] = useState<{ time: string; avgRisk: number; volume: number; movingAvg?: number }[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortField, setSortField] = useState<'riskScore' | 'name' | 'salary' | 'yearsAtCompany'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadDashboardData = useCallback(() => {
    getMe()
      .then((res) => {
        const userRole = res.data.role;
        setRole(userRole);
        setOrganizationName(res.data.organization || 'Your Organization');
        
        if (userRole === 'HR' || userRole === 'ORGANISATION') {
          fetchEmployees()
            .then((empRes) => {
              setEmployees((prev) => {
                const newEmployees = empRes.data;
                if (prev.length > 0) {
                  const newFlashes: Record<number, 'up' | 'down'> = {};
                  let changed = false;
                  newEmployees.forEach((newEmp: Employee) => {
                    const oldEmp = prev.find((e) => e.id === newEmp.id);
                    if (oldEmp && newEmp.riskScore !== oldEmp.riskScore) {
                      newFlashes[newEmp.id] = newEmp.riskScore > oldEmp.riskScore ? 'up' : 'down';
                      changed = true;
                    }
                  });
                  if (changed) {
                    setFlashStates((prevFlashes) => ({ ...prevFlashes, ...newFlashes }));
                    setTimeout(() => {
                      setFlashStates((prevFlashes) => {
                        const cleared = { ...prevFlashes };
                        Object.keys(newFlashes).forEach((id) => delete cleared[Number(id)]);
                        return cleared;
                      });
                    }, 1500);
                  }
                }
                return newEmployees;
              });
            })
            .catch(() => setEmployees([]));

          fetchWorkforceAiAnalytics()
            .then((aiRes) => {
              if (aiRes.data?.aiWorkforceReport) {
                setAiWorkforceReport(aiRes.data.aiWorkforceReport);
              }
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      if (role === 'HR' || role === 'ORGANISATION') {
        fetchEmployees()
          .then((empRes) => {
            setEmployees((prev) => {
              const newEmployees = empRes.data;
              if (prev.length > 0) {
                const newFlashes: Record<number, 'up' | 'down'> = {};
                let changed = false;
                newEmployees.forEach((newEmp: Employee) => {
                  const oldEmp = prev.find((e) => e.id === newEmp.id);
                  if (oldEmp && newEmp.riskScore !== oldEmp.riskScore) {
                    newFlashes[newEmp.id] = newEmp.riskScore > oldEmp.riskScore ? 'up' : 'down';
                    changed = true;
                  }
                });
                if (changed) {
                  setFlashStates((prevFlashes) => ({ ...prevFlashes, ...newFlashes }));
                  setTimeout(() => {
                    setFlashStates((prevFlashes) => {
                      const cleared = { ...prevFlashes };
                      Object.keys(newFlashes).forEach((id) => delete cleared[Number(id)]);
                      return cleared;
                    });
                  }, 1500);
                }
              }
              return newEmployees;
            });
          })
          .catch(console.error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loadDashboardData, role]);

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

  useEffect(() => {
    if (employees.length > 0 && riskHistory.length === 0) {
      // Seed initial data for chart to look realistic
      const now = new Date();
      const seed = Array.from({ length: 20 }).map((_, i) => {
        const t = new Date(now.getTime() - (20 - i) * 60000); // spread over minutes initially
        const jitter = (Math.random() - 0.5) * 4;
        const val = Math.max(0, Math.min(100, Number((avgProb + (i === 19 ? 0 : jitter)).toFixed(1))));
        return {
          time: t.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          avgRisk: val,
          volume: Math.floor(Math.random() * 50) + 10,
          movingAvg: val // simplistic seed
        };
      });
      setRiskHistory(seed);
    }
  }, [employees, riskHistory.length, avgProb]);

  useEffect(() => {
    if (employees.length === 0) return;
    const currentVal = Number(avgProb.toFixed(1));

    setRiskHistory(prev => {
      if (prev.length === 0) return prev;
      const lastPoint = prev[prev.length - 1];
      
      // ONLY push a new point if the value has actually changed!
      if (lastPoint.avgRisk === currentVal) {
        return prev;
      }

      const newPoint = {
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        avgRisk: currentVal,
        volume: Math.floor(Math.random() * 100) + 20, // Activity spike on change
        movingAvg: currentVal
      };
      
      const next = [...prev, newPoint];
      if (next.length >= 5) {
        const slice = next.slice(-5);
        newPoint.movingAvg = Number((slice.reduce((acc, p) => acc + p.avgRisk, 0) / 5).toFixed(1));
      }

      if (next.length > 40) next.shift(); // keep rolling window
      return next;
    });
  }, [avgProb, employees.length]);

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

  if (role === 'EMPLOYEE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400 mb-4 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Welcome to {organizationName}</h1>
        <p className="max-w-md mx-auto text-sm leading-relaxed text-green-100/50">
          Your employee portal is ready. Head over to your Enterprise Profile to update your details, or check out the LinkedIn Feed to connect with colleagues.
        </p>
        <div className="mt-8 flex gap-4">
          <a href="/dashboard/my-profile" className="rounded-xl px-6 py-2.5 text-sm font-bold text-black transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)' }}>
            My Profile
          </a>
          <a href="/dashboard/feed" className="rounded-xl border px-6 py-2.5 text-sm font-bold transition hover:bg-green-500/20" style={{ borderColor: 'var(--border-subtle)', color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
            Social Feed
          </a>
        </div>
      </div>
    );
  }

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

      {/* Real-time Risk Trend Chart */}
      <section className="rounded-3xl border p-6 sm:p-8" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-green-400" />
              Live Attrition Risk Trend
            </h2>
            <p className="mt-1 text-xs text-green-100/40">Dynamic chart rendering only upon structural risk shifts.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4 text-xs font-bold bg-black/20 px-4 py-2 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <span className="text-muted mr-2">LAST:</span>
              <span className={riskHistory.length > 1 && riskHistory[riskHistory.length-1].avgRisk > riskHistory[riskHistory.length-2].avgRisk ? 'text-red-400' : 'text-green-400'}>
                {riskHistory[riskHistory.length-1]?.avgRisk}%
              </span>
            </div>
            <div className="w-px h-4 bg-green-500/20"></div>
            <div>
              <span className="text-muted mr-2">MA(5):</span>
              <span className="text-blue-400">{riskHistory[riskHistory.length-1]?.movingAvg}%</span>
            </div>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={riskHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 136, 0.1)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} />
              <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="rgba(255,255,255,0.2)" fontSize={10} tickFormatter={(val) => `${val}%`} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ fontWeight: 'bold' }}
                labelStyle={{ color: 'var(--text-muted)', marginBottom: '5px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="right" dataKey="volume" name="Volatility" fill="rgba(255,255,255,0.05)" radius={[2, 2, 0, 0]} />
              <Bar yAxisId="left" dataKey="avgRisk" name="Avg Risk" fill="url(#colorRisk)" radius={[4, 4, 0, 0]} isAnimationActive={false} barSize={20} />
              <Line yAxisId="left" type="monotone" dataKey="movingAvg" name="5-Point MA" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Stock Watchlist Style Employee Risk Monitor — DIRECTLY BELOW KPI CARDS */}
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
                <th className="px-5 py-4">Tenure</th>
                <th className="px-5 py-4">Rating</th>
                <th className="px-5 py-4">Attrition Risk</th>
                <th className="px-5 py-4">Risk Status</th>
                <th className="px-5 py-4">Timeline</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {filteredEmployees.map((emp) => {
                const prob = Math.round(emp.riskScore * 100);
                const flashState = flashStates[emp.id];
                const flashClass = flashState === 'up' ? 'animate-flash-red' : flashState === 'down' ? 'animate-flash-green' : '';
                return (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`cursor-pointer transition hover:bg-emerald-500/5 ${flashClass}`}
                  >
                    <td className="px-5 py-4 font-mono text-green-100/30">#{emp.id}</td>
                    <td className="px-5 py-4 font-extrabold text-white">{emp.name}</td>
                    <td className="px-5 py-4 text-green-100/60 font-medium">{emp.department}</td>
                    <td className="px-5 py-4 text-white font-semibold">${Number(emp.salary).toLocaleString()}</td>
                    <td className="px-5 py-4 text-green-100/60">{emp.yearsAtCompany} yrs</td>
                    <td className="px-5 py-4 font-mono text-emerald-400 font-bold">{emp.performanceRating} / 5.0</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/40">
                          <div
                            className={`h-full rounded-full ${prob >= 70 ? 'bg-red-500' : prob >= 40 ? 'bg-amber-400' : 'bg-green-500'}`}
                            style={{ width: `${prob}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-white">{prob}%</span>
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
                  <td colSpan={10} className="px-5 py-12 text-center text-xs text-green-100/30">
                    No employee records match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
              <h2 className="text-base font-extrabold uppercase tracking-widest text-foreground">Gemini AI Executive Strategy</h2>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">
              Gemini 1.5 Flash
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-500/15 bg-background/60 p-4 text-xs">
            {aiWorkforceReport ? (
              <AiReportRenderer reportText={aiWorkforceReport} />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-foreground text-sm">Key Organizational Insights</p>
                  <p className="mt-2 text-muted leading-relaxed">
                    {highestRiskDept !== 'N/A'
                      ? `${highestRiskDept} department exhibits the highest risk density.`
                      : 'Workforce risk levels are within stable parameters across departments.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Detail & Simulator Modal */}
      {selectedEmployeeId && (
        <EmployeeDetailModal
          employeeId={selectedEmployeeId}
          onClose={() => {
            setSelectedEmployeeId(null);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
}
