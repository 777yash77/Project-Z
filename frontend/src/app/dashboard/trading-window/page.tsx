'use client';

import { useEffect, useState } from 'react';
import { ArrowRightLeft, ShieldCheck, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { saveTradingWindowConfig, fetchTradingWindowConfig, fetchEmployees, fetchOrganizations, evaluateTransferEligibility, createTransferRequest, fetchTransferRequests, approveTransferStep } from '../api';

export default function TalentTradingWindowPage() {
  const [config, setConfig] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  // Policy Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0]);
  const [minTenureMonths, setMinTenureMonths] = useState(6);
  const [minPerformanceRating, setMinPerformanceRating] = useState(3.0);

  // Request Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [selectedTargetOrgId, setSelectedTargetOrgId] = useState<number | ''>('');
  const [targetDept, setTargetDept] = useState('Engineering');
  const [targetDesig, setTargetDesig] = useState('Senior Software Engineer');
  const [reason, setReason] = useState('');
  const [evalResult, setEvalResult] = useState<any>(null);

  const loadData = async () => {
    try {
      const cfgRes = await fetchTradingWindowConfig();
      setConfig(cfgRes.data);
      const empRes = await fetchEmployees();
      setEmployees(empRes.data || []);
      const orgRes = await fetchOrganizations();
      setOrganizations(orgRes.data || []);
      const reqRes = await fetchTransferRequests();
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveTradingWindowConfig({
        startDate,
        endDate,
        minTenureMonths,
        minPerformanceRating,
        active: true,
      });
      alert('Transfer Window Policy Saved Successfully!');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedEmployeeId || !selectedTargetOrgId) return;
    try {
      const res = await evaluateTransferEligibility({
        employeeId: Number(selectedEmployeeId),
        targetOrgId: Number(selectedTargetOrgId),
      });
      setEvalResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !selectedTargetOrgId) return;
    try {
      const res = await createTransferRequest({
        employeeId: Number(selectedEmployeeId),
        targetOrgId: Number(selectedTargetOrgId),
        targetDepartment: targetDept,
        targetDesignation: targetDesig,
        reason,
      });
      alert(`Transfer Request Submitted! Status: ${res.data.status}`);
      setSelectedEmployeeId('');
      setSelectedTargetOrgId('');
      setEvalResult(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveStep = async (id: number) => {
    try {
      await approveTransferStep(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Indian Talent Trading Window & Rule Engine</h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Configurable internal talent mobility platform with transfer freeze periods, tenure/performance checks, and multi-step approvals.
        </p>
      </div>

      {/* Grid: Policy Config & Request Submission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Configure Trading Window Policy */}
        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            <ShieldCheck size={16} /> Configure Organisation Transfer Window Policy
          </h3>

          <form onSubmit={handleSavePolicy} className="space-y-3 text-xs">
            <div>
              <label className="block mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>Window Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl px-3 py-2 outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>Window End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl px-3 py-2 outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>Min Tenure (Months)</label>
                <input
                  type="number"
                  value={minTenureMonths}
                  onChange={(e) => setMinTenureMonths(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 outline-none"
                  style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>Min Performance Rating</label>
                <input
                  type="number"
                  step="0.1"
                  value={minPerformanceRating}
                  onChange={(e) => setMinPerformanceRating(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 outline-none"
                  style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <button type="submit" className="w-full rounded-xl py-2.5 font-bold text-black text-xs" style={{ backgroundColor: 'var(--accent)' }}>
              Save Transfer Policy Rules
            </button>
          </form>

          {config?.id && (
            <div className="mt-4 rounded-xl p-3 text-[11px] space-y-1" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
              <p className="font-bold text-green-400">✓ Active Window Policy Configured</p>
              <p style={{ color: 'var(--text-muted)' }}>Window: {config.startDate} to {config.endDate}</p>
              <p style={{ color: 'var(--text-muted)' }}>Rules: Tenure ≥ {config.minTenureMonths} months | Rating ≥ {config.minPerformanceRating}</p>
            </div>
          )}
        </div>

        {/* Right: Submit Talent Transfer Request */}
        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            <ArrowRightLeft size={16} /> Submit Internal Talent Transfer Request
          </h3>

          <form onSubmit={handleSubmitRequest} className="space-y-3 text-xs">
            <div>
              <label className="block mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>Select Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                className="w-full rounded-xl px-3 py-2 outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.department} - {emp.designation || 'Engineer'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>Target Partner Organisation</label>
              <select
                value={selectedTargetOrgId}
                onChange={(e) => setSelectedTargetOrgId(Number(e.target.value))}
                className="w-full rounded-xl px-3 py-2 outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                <option value="">-- Choose Target Organisation --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name} ({org.location})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEvaluate}
                disabled={!selectedEmployeeId || !selectedTargetOrgId}
                className="w-1/2 rounded-xl py-2 font-semibold text-xs border transition disabled:opacity-50"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
              >
                Run Rule Engine Check
              </button>

              <button
                type="submit"
                disabled={!selectedEmployeeId || !selectedTargetOrgId}
                className="w-1/2 rounded-xl py-2 font-semibold text-xs text-black transition disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Submit Transfer Request
              </button>
            </div>
          </form>

          {/* Rule Evaluation Drawer */}
          {evalResult && (
            <div className="rounded-xl p-4 text-xs space-y-2" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider">Rule Engine Outcome:</span>
                <span className={`font-black uppercase ${evalResult.eligible ? 'text-green-400' : 'text-red-400'}`}>
                  {evalResult.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                </span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc pl-4" style={{ color: 'var(--text-muted)' }}>
                {evalResult.ruleEvaluations?.map((item: string, idx: number) => (
                  <li key={idx} className={item.startsWith('FAILED') ? 'text-red-400' : ''}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Request Approval Pipeline */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>Talent Transfer Approval Pipeline</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th className="pb-2">Employee</th>
                <th className="pb-2">From Org</th>
                <th className="pb-2">To Org</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Applied At</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="py-3 font-bold" style={{ color: 'var(--text-primary)' }}>{req.employee?.name}</td>
                  <td className="py-3" style={{ color: 'var(--text-muted)' }}>{req.fromOrganization?.name}</td>
                  <td className="py-3" style={{ color: 'var(--text-muted)' }}>{req.toOrganization?.name}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      req.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' :
                      req.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>{new Date(req.appliedAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    {req.status !== 'APPROVED' && req.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleApproveStep(req.id)}
                        className="rounded-lg px-3 py-1 text-[11px] font-bold text-black"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        Approve Step ({req.status})
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
