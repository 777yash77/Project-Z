'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, DollarSign, Users as UsersIcon, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { fetchEmployees, getCurrentUserProfile } from './api';

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
  const [organizationName, setOrganizationName] = useState('Your organization');

  useEffect(() => {
    Promise.all([fetchEmployees(), getCurrentUserProfile()])
      .then(([employeesRes, profileRes]) => {
        setEmployees(employeesRes.data);
        setOrganizationName(profileRes.data.organization || 'Your organization');
      })
      .catch(() => setEmployees([]));
  }, []);

  const totalEmployees = employees.length;
  const highRiskCount = employees.filter((e) => e.riskLevel === 'High').length;
  const mediumRiskCount = employees.filter((e) => e.riskLevel === 'Medium').length;
  const lowRiskCount = employees.filter((e) => e.riskLevel === 'Low').length;
  const avgSalary = employees.length
    ? (employees.reduce((sum, e) => sum + Number(e.salary), 0) / employees.length).toFixed(0)
    : '0';
  const avgRating = employees.length
    ? (employees.reduce((sum, e) => sum + e.performanceRating, 0) / employees.length).toFixed(1)
    : '0.0';
  const topAtRisk = [...employees].sort((a, b) => b.riskScore - a.riskScore).slice(0, 7);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="rounded-2xl border border-green-500/12 bg-[#060e09] p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400/50">Retention Intelligence</p>
            <h1 className="mt-2 text-3xl font-bold text-white">People Risk Overview</h1>
            <p className="mt-1.5 max-w-xl text-sm text-green-100/35">
              {organizationName} — real-time employee risk, retention signals, and trade opportunities.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Staff', value: totalEmployees, icon: UsersIcon, color: 'text-green-400' },
              { label: 'High Risk', value: highRiskCount, icon: AlertTriangle, color: 'text-red-400' },
              { label: 'Avg Salary', value: `$${Number(avgSalary).toLocaleString()}`, icon: DollarSign, color: 'text-green-400' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl border border-green-500/10 bg-black/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-green-100/30">{stat.label}</p>
                    <Icon size={14} className={stat.color} />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Middle row */}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Risk Distribution */}
        <section className="rounded-2xl border border-green-500/10 bg-[#060e09] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Risk Distribution</h2>
              <p className="mt-0.5 text-xs text-green-100/30">Where attention is needed most</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-green-500/15 bg-green-500/8 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-green-400">
              <Activity size={10} /> Live
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {[
              { label: 'High Risk', value: highRiskCount, barColor: 'bg-red-500', textColor: 'text-red-400', borderColor: 'border-red-500/15' },
              { label: 'Medium Risk', value: mediumRiskCount, barColor: 'bg-amber-400', textColor: 'text-amber-400', borderColor: 'border-amber-500/15' },
              { label: 'Low Risk', value: lowRiskCount, barColor: 'bg-green-500', textColor: 'text-green-400', borderColor: 'border-green-500/15' },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl border ${item.borderColor} bg-black/30 p-4`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-100/60">{item.label}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-white">{item.value}</p>
                    <span className={`text-xs font-semibold ${item.textColor}`}>
                      {Math.round((item.value / Math.max(totalEmployees, 1)) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/50">
                  <div
                    className={`h-full rounded-full ${item.barColor} transition-all duration-700`}
                    style={{ width: `${Math.round((item.value / Math.max(totalEmployees, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Summary */}
        <section className="rounded-2xl border border-green-500/10 bg-[#060e09] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">HR Performance</h2>
              <p className="mt-0.5 text-xs text-green-100/30">Aggregate workforce metrics</p>
            </div>
            <TrendingUp size={18} className="text-green-400" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { label: 'Avg Rating', value: avgRating },
              { label: 'Total Analyzed', value: totalEmployees },
              { label: 'Low Risk', value: lowRiskCount },
              { label: 'Med Risk', value: mediumRiskCount },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-green-500/8 bg-black/30 p-4">
                <p className="text-xs text-green-100/30">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-green-500/10 bg-green-500/5 p-4">
            <p className="text-xs text-green-400/60">
              All entries are scored using the built-in retention algorithm and synced to the backend automatically.
            </p>
          </div>
        </section>
      </div>

      {/* Top At Risk Table */}
      <section className="rounded-2xl border border-green-500/10 bg-[#060e09] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Top Employees by Risk</h2>
            <p className="mt-0.5 text-xs text-green-100/30">Sorted by risk score — highest first</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-green-500/15 bg-green-500/8 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-green-400">
            <BarChart3 size={10} /> Sorted by score
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-green-500/8">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-green-500/8 bg-black/30">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-green-400/40">Name</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-green-400/40">Department</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-green-400/40">Score</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-green-400/40">Risk Level</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-green-400/40">Salary</th>
              </tr>
            </thead>
            <tbody>
              {topAtRisk.map((employee, i) => (
                <tr key={employee.id} className="border-t border-green-500/5 transition hover:bg-green-500/3">
                  <td className="px-5 py-3.5 font-medium text-white">{employee.name}</td>
                  <td className="px-5 py-3.5 text-green-100/50">{employee.department}</td>
                  <td className="px-5 py-3.5 font-mono text-green-100/70">{employee.riskScore.toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      employee.riskLevel === 'High'
                        ? 'bg-red-500/12 text-red-400'
                        : employee.riskLevel === 'Medium'
                        ? 'bg-amber-500/12 text-amber-400'
                        : 'bg-green-500/12 text-green-400'
                    }`}>
                      {employee.riskLevel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-green-100/50">${Number(employee.salary).toLocaleString()}</td>
                </tr>
              ))}
              {topAtRisk.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-green-100/25">No employee data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
