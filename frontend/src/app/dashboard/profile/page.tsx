'use client';

import { useEffect, useState } from 'react';
import { Building2, MapPin, Users, Hash, ShieldCheck, Mail, UserCheck, Briefcase, Pencil, CheckCircle2, X, Camera, Trash2, UserX } from 'lucide-react';
import { fetchHrProfile, fetchHrUsers, deleteHrUser, updateHrProfile, updateOrganizationDetails } from '../api';

export default function HrProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [hrUsers, setHrUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', location: '', industry: '' });
  const [avatarForm, setAvatarForm] = useState({ avatarUrl: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchHrProfile(), fetchHrUsers()])
      .then(([profileRes, usersRes]) => {
        setProfile(profileRes.data);
        setHrUsers(usersRes.data);
        const org = profileRes.data.organizationDetails || {};
        setEditForm({
          name: org.name || profileRes.data.organization || '',
          location: org.location || 'Global HQ',
          industry: org.industry || 'Technology Services',
        });
        setAvatarForm({
          avatarUrl: profileRes.data.avatarUrl || '',
          role: profileRes.data.role || 'HR Lead',
        });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOrgUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateOrganizationDetails(editForm);
      setMessage('Organization details updated successfully.');
      setShowEditModal(false);
      loadData();
    } catch {
      setMessage('Failed to update organization details.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateHrProfile(avatarForm);
      setMessage('Profile picture & role updated successfully.');
      setShowAvatarModal(false);
      loadData();
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (id: number, username: string) => {
    if (!window.confirm(`Are you sure you want to remove test account "${username}"?`)) return;
    try {
      await deleteHrUser(id);
      setMessage(`Removed account ${username}.`);
      loadData();
    } catch {
      setMessage(`Failed to remove user.`);
    }
  };

  const org = profile?.organizationDetails || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="rounded-3xl border border-emerald-500/20 bg-card p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                Official Profile
              </span>
              <span className="text-xs text-muted">HR & Organization Credentials</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">HR & Organization Profile</h1>
            <p className="mt-1 text-sm text-muted">Verified enterprise HR account, profile avatar, and organizational identity.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAvatarModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-md"
            >
              <Camera size={15} /> Edit Profile Picture
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-background px-5 py-3 text-xs font-bold text-foreground transition hover:bg-emerald-500/10"
            >
              <Pencil size={15} className="text-emerald-500" /> Edit Office Details
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} /> {message}
          </span>
          <button onClick={() => setMessage('')}><X size={14} className="hover:opacity-75" /></button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">

        {/* HR Officer Identity Card */}
        <section className="rounded-3xl border border-emerald-500/20 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-lg">
          <div>
            {/* Avatar & Badge */}
            <div className="flex items-start justify-between">
              <div className="relative group">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile?.username || 'Avatar'}
                    className="h-24 w-24 rounded-3xl object-cover border-2 border-emerald-500 shadow-xl"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-3xl font-extrabold text-white shadow-xl">
                    {profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'HR'}
                  </div>
                )}
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute -bottom-2 -right-2 rounded-full border border-emerald-500/30 bg-emerald-600 p-2 text-white shadow-lg transition hover:bg-emerald-500"
                  title="Change Profile Picture"
                >
                  <Camera size={13} />
                </button>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                <Hash size={12} className="inline mr-1" />
                {profile?.hrCode || 'HRC-0001'}
              </div>
            </div>

            {/* Name & Role */}
            <div className="mt-6">
              <h2 className="text-2xl font-extrabold text-foreground">{profile?.username || 'Loading HR...'}</h2>
              <p className="mt-1 text-xs font-bold text-emerald-500 uppercase tracking-widest">{profile?.role || 'HR Director'} Account</p>
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
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-emerald-500/15 bg-background/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                        <Icon size={16} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted">{item.label}</p>
                        <p className="mt-0.5 text-xs font-bold text-foreground">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-500/10 bg-background/40 p-4 text-xs text-muted">
            All operations executed under this HR Code are signed with encrypted JWT claims.
          </div>
        </section>

        {/* Right Section: Office Infrastructure & User Account Management */}
        <div className="space-y-6">
          {/* Organization & Office Infrastructure Card */}
          <section className="rounded-3xl border border-emerald-500/20 bg-card p-6 sm:p-8 space-y-6 shadow-lg">
            <div>
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <Building2 size={18} />
                <h2 className="text-xs font-bold uppercase tracking-widest">Office Infrastructure</h2>
              </div>
              <h3 className="text-2xl font-extrabold text-foreground">{org.name || profile?.organization || 'Organization'}</h3>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Your Managed Employees', value: `${profile?.totalEmployees || 0} Staff`, icon: Users, accent: 'text-foreground' },
                { label: 'Office Location', value: org.location || 'Global HQ', icon: MapPin, accent: 'text-emerald-500' },
                { label: 'Industry Sector', value: org.industry || 'Enterprise HR', icon: Briefcase, accent: 'text-foreground' },
                { label: 'System Entity Code', value: `ORG-ID #${org.id || 1}`, icon: Hash, accent: 'text-amber-500' },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="rounded-2xl border border-emerald-500/15 bg-background/60 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-widest text-muted">{metric.label}</p>
                      <Icon size={16} className="text-emerald-500" />
                    </div>
                    <p className={`mt-3 text-xl font-extrabold ${metric.accent}`}>{metric.value}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Account Cleanup Panel */}
          {hrUsers.length > 0 && (
            <section className="rounded-3xl border border-emerald-500/20 bg-card p-6 sm:p-8 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-emerald-500/15 pb-3">
                <div className="flex items-center gap-2">
                  <UserX size={18} className="text-red-500" />
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-foreground">Other Registered HR Accounts</h3>
                </div>
                <span className="text-xs text-muted">{hrUsers.length} Users</span>
              </div>
              <p className="text-xs text-muted">Manage or remove test HR accounts created during development.</p>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {hrUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-2xl border border-emerald-500/10 bg-background/60 p-3 text-xs">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.username} className="h-8 w-8 rounded-full object-cover border border-emerald-500/30" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 font-bold text-emerald-500">
                          {u.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-foreground">{u.username}</p>
                        <p className="text-[10px] text-muted">{u.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAccount(u.id, u.username)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={12} className="inline mr-1" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Edit Profile Picture Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 dark:bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Profile Picture & Role</h3>
                <p className="text-xs text-slate-400">Provide an image URL to set your custom HR profile avatar.</p>
              </div>
              <button onClick={() => setShowAvatarModal(false)} className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAvatarUpdate} className="space-y-4 text-xs">
              {avatarForm.avatarUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={avatarForm.avatarUrl}
                    alt="Preview"
                    className="h-20 w-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                    onError={(e: any) => (e.target.style.display = 'none')}
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Profile Picture Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-... or https://example.com/avatar.jpg"
                  value={avatarForm.avatarUrl}
                  onChange={(e) => setAvatarForm({ ...avatarForm, avatarUrl: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">HR Role / Title</label>
                <input
                  type="text"
                  placeholder="e.g. HR Director, Senior HR Lead"
                  value={avatarForm.role}
                  onChange={(e) => setAvatarForm({ ...avatarForm, role: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-emerald-400 shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Profile Picture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Office Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 dark:bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Organization Profile</h3>
                <p className="text-xs text-slate-400">Update office name, location and industry sector.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleOrgUpdate} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Organization Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Office Location</label>
                <input
                  type="text"
                  placeholder="e.g. Seattle, WA HQ or Global Branch"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Industry Sector</label>
                <input
                  type="text"
                  value={editForm.industry}
                  onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-emerald-400 shadow-md"
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
