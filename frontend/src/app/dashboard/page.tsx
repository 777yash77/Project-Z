'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, DollarSign, Users as UsersIcon, BarChart3, TrendingUp } from 'lucide-react';

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

export default function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8080/api/employees', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployees([]));
  }, []);

  const totalEmployees = employees.length;
  const highRiskCount = employees.filter((e) => e.riskLevel === 'High').length;
  const mediumRiskCount = employees.filter((e) => e.riskLevel === 'Medium').length;
  const lowRiskCount = employees.filter((e) => e.riskLevel === 'Low').length;
  const avgSalary = employees.length ? (employees.reduce((sum, e) => sum + Number(e.salary), 0) / employees.length).toFixed(2) : '0.00';
  const avgRating = employees.length ? (employees.reduce((sum, e) => sum + e.performanceRating, 0) / employees.length).toFixed(1) : '0.0';
  const topAtRisk = employees.slice(0, 7);

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400/80">Retention Intelligence</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">People risk and retention overview</h1>
            <p className="mt-2 max-w-2xl text-slate-400">A unified dashboard that ranks employees by retention risk and makes CSV-driven imports part of your HR workflow.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-950/90 p-4 ring-1 ring-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <p className="text-xs uppercase tracking-[0.28em]">Total staff</p>
                <UsersIcon size={18} className="text-cyan-400" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{totalEmployees}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/90 p-4 ring-1 ring-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <p className="text-xs uppercase tracking-[0.28em]">High risk</p>
                <AlertTriangle size={18} className="text-rose-400" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{highRiskCount}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/90 p-4 ring-1 ring-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <p className="text-xs uppercase tracking-[0.28em]">Average salary</p>
                <DollarSign size={18} className="text-emerald-400" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">${avgSalary}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Risk distribution</h2>
              <p className="mt-1 text-sm text-slate-400">Understand where attention is needed most.</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">Live</span>
          </div>
          <div className="mt-6 space-y-4">
            {[
              { label: 'High risk', value: highRiskCount, accent: 'bg-rose-500/20 text-rose-300' },
              { label: 'Medium risk', value: mediumRiskCount, accent: 'bg-amber-500/20 text-amber-300' },
              { label: 'Low risk', value: lowRiskCount, accent: 'bg-emerald-500/20 text-emerald-300' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-slate-950/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm ${item.accent}`}>{Math.round((item.value / Math.max(totalEmployees, 1)) * 100)}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className={`h-full rounded-full ${item.accent.split(' ')[0]}`} style={{ width: `${Math.min(100, Math.round((item.value / Math.max(totalEmployees, 1)) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">HR performance summary</h2>
              <p className="mt-1 text-sm text-slate-400">Manual entries and CSV imports save automatically on the backend.</p>
            </div>
            <TrendingUp size={24} className="text-cyan-400" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/80 p-5">
              <p className="text-sm text-slate-400">Average rating</p>
              <p className="mt-3 text-3xl font-semibold text-white">{avgRating}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-5">
              <p className="text-sm text-slate-400">Employees analyzed</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalEmployees}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Top employees by risk</h2>
            <p className="mt-1 text-sm text-slate-400">Review, edit, or export the most at-risk profiles.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-4 py-2 text-sm text-slate-300">
            <BarChart3 size={16} /> Sorted by risk score
          </div>
        </div>
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/70">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Score</th>
                <th className="px-5 py-4">Risk Level</th>
                <th className="px-5 py-4">Salary</th>
              </tr>
            </thead>
            <tbody>
              {topAtRisk.map((employee) => (
                <tr key={employee.id} className="border-t border-slate-800 hover:bg-slate-900/80">
                  <td className="px-5 py-4 font-medium text-white">{employee.name}</td>
                  <td className="px-5 py-4 text-slate-300">{employee.department}</td>
                  <td className="px-5 py-4 text-slate-300">{employee.riskScore.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${employee.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-300' : employee.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {employee.riskLevel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-300">${Number(employee.salary).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
