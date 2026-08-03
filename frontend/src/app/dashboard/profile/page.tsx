'use client';

import { useEffect, useState } from 'react';
import { Building2, MapPin, Users, Hash, ShieldCheck, Mail, UserCheck, Briefcase, Calendar, Pencil, CheckCircle2, X } from 'lucide-react';
import { fetchHrProfile, updateOrganizationDetails } from '../api';

export default function HrProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', location: '', industry: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadProfile = () => {
    setLoading(true);
    fetchHrProfile()
      .then((res) => {
        setProfile(res.data);
        const org = res.data.organizationDetails || {};
        setEditForm({
          name: org.name || res.data.organization || '',
          location: org.location || 'Global HQ',
          industry: org.industry || 'Technology Services',
        });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateOrganizationDetails(editForm);
      setMessage('Organization details updated successfully.');
      setShowEditModal(false);
      loadProfile();
    } catch {
      setMessage('Failed to update details.');
    } finally {
      setSaving(false);
    }
  };

  const org = profile?.organizationDetails || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="rounded-3xl border p-6 sm:p-8" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em]" style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent)' }}>
                Official Profile
              </span>
              <span className="text-xs text-green-100/30">HR & Organization Credentials</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">HR & Organization Profile</h1>
            <p className="mt-1 text-sm text-green-100/40">Verified enterprise HR account, organizational identity, and office capacity metrics.</p>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold text-white transition hover:bg-green-500/10"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <Pencil size={15} className="text-green-400" /> Edit Office Details
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center justify-between rounded-2xl border p-4 text-xs" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,135,74,0.1)' }}>
          <span className="flex items-center gap-2 font-semibold text-green-400">
            <CheckCircle2 size={16} /> {message}
          </span>
          <button onClick={() => setMessage('')}><X size={14} className="text-green-100/40 hover:text-white" /></button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">

        {/* HR Officer Identity Card */}
        <section className="rounded-3xl border p-6 sm:p-8 flex flex-col justify-between" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
          <div>
            {/* Avatar & Badge */}
            <div className="flex items-start justify-between">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-black text-black shadow-[0_0_24px_var(--accent-glow)]" style={{ backgroundColor: 'var(--accent)' }}>
                {profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'HR'}
              </div>
              <div className="rounded-full border px-3 py-1.5 text-xs font-mono font-bold" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}>
                <Hash size={12} className="inline mr-1" />
                {profile?.hrCode || 'HRC-0001'}
              </div>
            </div>

            {/* Name & Role */}
            <div className="mt-6">
              <h2 className="text-2xl font-extrabold text-white">{profile?.username || 'Loading HR...'}</h2>
              <p className="mt-1 text-xs font-semibold text-green-400 uppercase tracking-[0.2em]">{profile?.role || 'HR Director'} Account</p>
            </div>

            {/* Credential Details List */}
            <div className="mt-8 space-y-3">
              {[
                { label: 'HR Identification Code', value: profile?.hrCode || 'HRC-0001', icon: Hash },
                { label: 'Official Email', value: profile?.email || 'hr@organization.com', icon: Mail },
                { label: 'Assigned Role', value: `${profile?.role || 'HR'} Administrator`, icon: UserCheck },
                { label: 'Security Clearance', value: 'Level-5 Active JWT', icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border p-4 backdrop-blur-sm" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(0,135,74,0.1)' }}>
                        <Icon size={16} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-green-100/30">{item.label}</p>
                        <p className="mt-0.5 text-xs font-bold text-white">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border p-4 text-xs text-green-100/30" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
            All operations executed under this HR Code are signed with encrypted JWT claims.
          </div>
        </section>

        {/* Organization & Office Infrastructure Card */}
        <section className="rounded-3xl border p-6 sm:p-8 space-y-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
          <div>
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Building2 size={18} />
              <h2 className="text-xs font-bold uppercase tracking-[0.25em]">Office & Entity Infrastructure</h2>
            </div>
            <h3 className="text-2xl font-extrabold text-white">{org.name || profile?.organization || 'Organization'}</h3>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Total Office Employees', value: `${profile?.totalEmployees || 0} Staff`, icon: Users, accent: 'text-white' },
              { label: 'Office Location', value: org.location || 'Global HQ', icon: MapPin, accent: 'text-green-400' },
              { label: 'Industry Sector', value: org.industry || 'Enterprise HR', icon: Briefcase, accent: 'text-white' },
              { label: 'System Entity Code', value: `ORG-ID #${org.id || 1}`, icon: Hash, accent: 'text-amber-400' },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl border p-5" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-green-100/30">{metric.label}</p>
                    <Icon size={16} className="text-green-400" />
                  </div>
                  <p className={`mt-3 text-xl font-extrabold ${metric.accent}`}>{metric.value}</p>
                </div>
              );
            })}
          </div>

          {/* Department Breakdown */}
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Office Profile Snapshot</h4>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-green-100/40">Primary Office Location</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <MapPin size={13} className="text-green-400" /> {org.location || 'Global HQ'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-green-100/40">Active Workforce Headcount</span>
                <span className="font-bold text-white">{profile?.totalEmployees || 0} Employees Enrolled</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-green-100/40">Organization Creation Timestamp</span>
                <span className="font-mono text-green-100/60">{org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'Active'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-green-100/40">HR Authority Scope</span>
                <span className="font-semibold text-green-400">Full Administrative Rights</span>
              </div>
            </div>
          </div>

        </section>
      </div>

      {/* Edit Office Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)]" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Organization Profile</h3>
                <p className="text-xs text-green-100/30">Update office name, location and industry sector.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="rounded-xl border p-2 text-green-100/40 hover:text-white" style={{ borderColor: 'var(--border-subtle)' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-green-100/40 uppercase tracking-[0.15em]">Organization Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm text-white outline-none"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.4)' }}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-green-100/40 uppercase tracking-[0.15em]">Office Location</label>
                <input
                  type="text"
                  placeholder="e.g. Seattle, WA HQ or Global Branch"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm text-white outline-none"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.4)' }}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-green-100/40 uppercase tracking-[0.15em]">Industry Sector</label>
                <input
                  type="text"
                  value={editForm.industry}
                  onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm text-white outline-none"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.4)' }}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border px-5 py-2.5 text-xs text-green-100/40 transition hover:text-white"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-green-500 px-5 py-2.5 text-xs font-bold text-black transition hover:bg-green-400"
                >
                  {saving ? 'Saving...' : 'Save Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
