'use client';

import { useEffect, useState } from 'react';
import { UserPlus, ShieldAlert, Key, Building2, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { createHrAccount, fetchHrAccounts, updateHrAccountStatus, resetHrPassword, fetchAuditLogs, fetchDepartments, createDepartment } from '../api';

export default function OrganisationPortalPage() {
  const [hrAccounts, setHrAccounts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [activeTab, setActiveTab] = useState<'HR_MGMT' | 'AUDIT_LOGS' | 'DEPTS'>('HR_MGMT');

  const loadData = async () => {
    try {
      const hrRes = await fetchHrAccounts();
      setHrAccounts(hrRes.data || []);
      const auditRes = await fetchAuditLogs();
      setAuditLogs(auditRes.data || []);
      const deptRes = await fetchDepartments();
      setDepartments(deptRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateHr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail) return;
    try {
      const res = await createHrAccount({ username: newUsername, email: newEmail });
      alert(`HR Account Created! ID: ${res.data.id}`);
      setNewUsername('');
      setNewEmail('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating HR account');
    }
  };

  const handleStatusToggle = async (id: number, type: 'active' | 'suspended' | 'approved', currentValue: boolean) => {
    try {
      await updateHrAccountStatus(id, type, !currentValue);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      const res = await resetHrPassword(id);
      alert(`Password reset successfully! Temporary Password: ${res.data.temporaryPassword}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;
    try {
      await createDepartment({ name: newDeptName, code: newDeptCode });
      setNewDeptName('');
      setNewDeptCode('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Organisation Control Portal</h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Company ownership, HR credential management, security audit logs, and organizational hierarchy.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2 text-xs font-semibold" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('HR_MGMT')}
          className="rounded-xl px-4 py-2 transition"
          style={{
            backgroundColor: activeTab === 'HR_MGMT' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'HR_MGMT' ? 'black' : 'var(--text-muted)',
          }}
        >
          HR Credential Management
        </button>
        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className="rounded-xl px-4 py-2 transition"
          style={{
            backgroundColor: activeTab === 'AUDIT_LOGS' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'AUDIT_LOGS' ? 'black' : 'var(--text-muted)',
          }}
        >
          Complete Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('DEPTS')}
          className="rounded-xl px-4 py-2 transition"
          style={{
            backgroundColor: activeTab === 'DEPTS' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'DEPTS' ? 'black' : 'var(--text-muted)',
          }}
        >
          Departments & Hierarchy
        </button>
      </div>

      {/* Tab 1: HR Management */}
      {activeTab === 'HR_MGMT' && (
        <div className="space-y-6">
          {/* Create HR Box */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>
              <UserPlus size={16} /> Generate New HR Credentials
            </h3>
            <form onSubmit={handleCreateHr} className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="HR Username (e.g. hr_john)"
                className="rounded-xl px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="HR Email (e.g. hr@company.com)"
                className="rounded-xl px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <button type="submit" className="rounded-xl px-4 py-2 text-xs font-bold text-black" style={{ backgroundColor: 'var(--accent)' }}>
                Generate HR Account
              </button>
            </form>
          </div>

          {/* HR Accounts List */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>Active HR Managers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th className="pb-2">HR Code</th>
                    <th className="pb-2">Username</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Suspended</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {hrAccounts.map((hr) => (
                    <tr key={hr.id}>
                      <td className="py-3 font-mono text-[11px]" style={{ color: 'var(--accent)' }}>HRC-{String(hr.id).padStart(4, '0')}</td>
                      <td className="py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{hr.username}</td>
                      <td className="py-3" style={{ color: 'var(--text-muted)' }}>{hr.email}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${hr.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {hr.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${hr.suspended ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {hr.suspended ? 'Suspended' : 'Normal'}
                        </span>
                      </td>
                      <td className="py-3 space-x-2">
                        <button
                          onClick={() => handleStatusToggle(hr.id, 'active', hr.active)}
                          className="rounded-lg px-2 py-1 text-[10px] font-semibold"
                          style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        >
                          Toggle Active
                        </button>
                        <button
                          onClick={() => handleStatusToggle(hr.id, 'suspended', hr.suspended)}
                          className="rounded-lg px-2 py-1 text-[10px] font-semibold text-amber-400"
                          style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
                        >
                          {hr.suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => handleResetPassword(hr.id)}
                          className="rounded-lg px-2 py-1 text-[10px] font-semibold text-sky-400"
                          style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>HR & Organisation Security Audit Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Entity</th>
                  <th className="pb-2">Performed By</th>
                  <th className="pb-2">Old / New Details</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 font-bold" style={{ color: 'var(--accent)' }}>{log.action}</td>
                    <td className="py-2.5" style={{ color: 'var(--text-primary)' }}>{log.entityName} #{log.entityId}</td>
                    <td className="py-2.5" style={{ color: 'var(--text-primary)' }}>{log.performedBy} ({log.role})</td>
                    <td className="py-2.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {log.reason ? `${log.reason} | ` : ''}{log.newValue || log.oldValue || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Departments */}
      {activeTab === 'DEPTS' && (
        <div className="space-y-6">
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>Create Department</h3>
            <form onSubmit={handleCreateDepartment} className="flex gap-3">
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="Department Name (e.g. Engineering)"
                className="rounded-xl px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
                placeholder="Code (e.g. ENG)"
                className="rounded-xl px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <button type="submit" className="rounded-xl px-4 py-2 text-xs font-bold text-black" style={{ backgroundColor: 'var(--accent)' }}>
                Add Department
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((d) => (
              <div key={d.id} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <span className="font-mono text-[10px] font-bold text-black px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--accent)' }}>{d.code}</span>
                <h4 className="mt-2 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{d.name}</h4>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
