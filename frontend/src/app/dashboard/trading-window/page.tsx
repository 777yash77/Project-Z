'use client';

import { useEffect, useState } from 'react';
import { ArrowRightLeft, ShieldCheck, CheckCircle, XCircle, Clock, AlertTriangle, Settings, FileText, List } from 'lucide-react';
import { saveTradingWindowConfig, fetchTradingWindowConfig, fetchEmployees, fetchOrganizations, evaluateTransferEligibility, createTransferRequest, fetchTransferRequests, approveTransferStep, getMe } from '../api';

export default function TalentTradingWindowPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState('submit'); // 'submit', 'pipeline', 'policy'

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
      const userRes = await getMe();
      setUserInfo(userRes.data);

      const cfgRes = await fetchTradingWindowConfig();
      if (cfgRes.data) {
        setConfig(cfgRes.data);
      }
      
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
      setActiveTab('pipeline');
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

  const canConfigurePolicy = userInfo?.role === 'ORGANISATION' || userInfo?.role === 'HR';

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Talent Trading Window</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Manage internal talent mobility, evaluate transfer rules, and monitor approval pipelines.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'submit' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`}
          style={{ borderColor: activeTab === 'submit' ? 'var(--accent)' : 'transparent', color: activeTab === 'submit' ? 'var(--accent)' : 'var(--text-primary)' }}
        >
          <ArrowRightLeft size={16} /> New Transfer Request
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'pipeline' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`}
          style={{ borderColor: activeTab === 'pipeline' ? 'var(--accent)' : 'transparent', color: activeTab === 'pipeline' ? 'var(--accent)' : 'var(--text-primary)' }}
        >
          <List size={16} /> Active Transfers
        </button>
        {canConfigurePolicy && (
          <button
            onClick={() => setActiveTab('policy')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'policy' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`}
            style={{ borderColor: activeTab === 'policy' ? 'var(--accent)' : 'transparent', color: activeTab === 'policy' ? 'var(--accent)' : 'var(--text-primary)' }}
          >
            <Settings size={16} /> Policy Settings
          </button>
        )}
      </div>

      <div className="mt-6">
        {/* TAB 1: SUBMIT REQUEST */}
        {activeTab === 'submit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl p-6 shadow-sm space-y-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                  <FileText size={20} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Submit Transfer Request
                </h3>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4 text-sm">
                <div>
                  <label className="block mb-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>Select Employee</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                    className="w-full rounded-xl px-4 py-3 outline-none transition-colors focus:border-[var(--accent)]"
                    style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.department} - {emp.designation || 'Engineer'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>Target Partner Organisation</label>
                  <select
                    value={selectedTargetOrgId}
                    onChange={(e) => setSelectedTargetOrgId(Number(e.target.value))}
                    className="w-full rounded-xl px-4 py-3 outline-none transition-colors focus:border-[var(--accent)]"
                    style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    <option value="">-- Choose Target Organisation --</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name} ({org.location})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleEvaluate}
                    disabled={!selectedEmployeeId || !selectedTargetOrgId}
                    className="w-1/2 rounded-xl py-3 font-bold text-xs border transition disabled:opacity-50 hover:bg-[var(--bg-card)]"
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    Run Rule Engine Check
                  </button>

                  <button
                    type="submit"
                    disabled={!selectedEmployeeId || !selectedTargetOrgId}
                    className="w-1/2 rounded-xl py-3 font-bold text-xs text-black transition disabled:opacity-50 hover:opacity-90"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    Submit Transfer Request
                  </button>
                </div>
              </form>
            </div>

            {/* Rule Evaluation Drawer */}
            <div>
              {evalResult ? (
                <div className="rounded-2xl p-6 space-y-4 shadow-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: evalResult.eligible ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)' }}>
                  <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="font-bold text-sm tracking-wide">Rule Engine Outcome:</span>
                    {evalResult.eligible ? (
                      <span className="flex items-center gap-1.5 text-green-400 font-black px-3 py-1 bg-green-500/10 rounded-full text-xs">
                        <CheckCircle size={14} /> ELIGIBLE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-400 font-black px-3 py-1 bg-red-500/10 rounded-full text-xs">
                        <XCircle size={14} /> NOT ELIGIBLE
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3 pt-2">
                    {evalResult.ruleEvaluations?.map((item: string, idx: number) => {
                      const isFail = item.includes('FAILED');
                      const isInfo = item.includes('INFO');
                      return (
                        <li key={idx} className={`flex items-start gap-2 text-xs p-3 rounded-lg border ${isFail ? 'bg-red-500/5 border-red-500/20 text-red-400' : isInfo ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-primary)]'}`}>
                          {isFail ? <XCircle size={14} className="shrink-0 mt-0.5" /> : isInfo ? <AlertTriangle size={14} className="shrink-0 mt-0.5" /> : <CheckCircle size={14} className="shrink-0 mt-0.5 text-green-400" />}
                          <span className="leading-relaxed">{item.replace('FAILED: ', '').replace('PASSED: ', '').replace('INFO: ', '')}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="h-full rounded-2xl border border-dashed flex flex-col items-center justify-center p-8 text-center" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-base)' }}>
                  <ShieldCheck size={48} className="mb-4 opacity-20" />
                  <h4 className="font-bold text-[var(--text-primary)]">Awaiting Rule Engine</h4>
                  <p className="text-xs mt-2 text-[var(--text-muted)] max-w-[250px]">
                    Select an employee and target organisation, then click "Run Rule Engine Check" to evaluate their eligibility for transfer.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE TRANSFERS */}
        {activeTab === 'pipeline' && (
          <div className="rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                <Clock size={20} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Approval Pipeline
              </h3>
            </div>
            
            {requests.length === 0 ? (
              <div className="text-center py-12 text-sm text-[var(--text-muted)]">No active transfer requests found.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[var(--bg-base)]">
                    <tr className="border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th className="px-4 py-3 font-semibold">Employee</th>
                      <th className="px-4 py-3 font-semibold">From Org</th>
                      <th className="px-4 py-3 font-semibold">To Org</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Applied At</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-[var(--bg-base)] transition-colors">
                        <td className="px-4 py-4 font-bold text-[var(--text-primary)]">{req.employee?.name}</td>
                        <td className="px-4 py-4 text-[var(--text-muted)]">{req.fromOrganization?.name}</td>
                        <td className="px-4 py-4 text-[var(--text-muted)]">{req.toOrganization?.name}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
                            req.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' :
                            req.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-[var(--text-muted)]">{new Date(req.appliedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4 text-right">
                          {req.status !== 'APPROVED' && req.status !== 'REJECTED' && canConfigurePolicy && (
                            <button
                              onClick={() => handleApproveStep(req.id)}
                              className="rounded-lg px-4 py-1.5 text-xs font-bold text-black hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: 'var(--accent)' }}
                            >
                              Approve ({req.status})
                            </button>
                          )}
                          {req.status !== 'APPROVED' && req.status !== 'REJECTED' && !canConfigurePolicy && (
                            <span className="text-xs text-[var(--text-muted)] italic">Pending Admin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: POLICY SETTINGS */}
        {activeTab === 'policy' && canConfigurePolicy && (
          <div className="max-w-2xl rounded-2xl p-6 shadow-sm border space-y-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                <Settings size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Organisation Transfer Policy
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Configure the rules for outward talent mobility.</p>
              </div>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>Window Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors"
                    style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>Window End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors"
                    style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>Min Tenure (Months)</label>
                  <input
                    type="number"
                    value={minTenureMonths}
                    onChange={(e) => setMinTenureMonths(Number(e.target.value))}
                    className="w-full rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors"
                    style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>Min Performance Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    value={minPerformanceRating}
                    onChange={(e) => setMinPerformanceRating(Number(e.target.value))}
                    className="w-full rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors"
                    style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button type="submit" className="w-full rounded-xl py-3 font-bold text-black text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--accent)' }}>
                  Save Transfer Policy Rules
                </button>
              </div>
            </form>

            {config?.id && (
              <div className="mt-6 rounded-xl p-4 flex items-start gap-3 bg-green-500/10 border border-green-500/20">
                <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-400">Active Window Policy Configured</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Window: {config.startDate} to {config.endDate}</p>
                  <p className="text-xs text-[var(--text-muted)]">Rules: Tenure ≥ {config.minTenureMonths} months | Rating ≥ {config.minPerformanceRating}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
