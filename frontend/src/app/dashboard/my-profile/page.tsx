'use client';

import { useEffect, useState } from 'react';
import { Lock, UserCheck, Briefcase, GraduationCap, Award, FileText, Globe, Edit3, Plus, PlusCircle } from 'lucide-react';
import { fetchMyProfile, updateBio, addExperience, addEducation, addSkill, addDocument } from '../api';

export default function MyEnterpriseProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);

  // New Experience State
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const loadProfile = async () => {
    try {
      const res = await fetchMyProfile();
      setProfileData(res.data);
      setHeadline(res.data.user?.headline || '');
      setBio(res.data.user?.bio || '');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateBio = async () => {
    try {
      await updateBio({ headline, bio });
      setIsEditingBio(false);
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      await addSkill(newSkill.trim());
      setNewSkill('');
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany || !expTitle) return;
    try {
      await addExperience({ company: expCompany, title: expTitle, description: expDesc });
      setExpCompany('');
      setExpTitle('');
      setExpDesc('');
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const user = profileData?.user;
  const employment = profileData?.employmentDetails;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Cover & Profile Header Card */}
      <div className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {/* Cover Photo */}
        <div className="h-40 w-full" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #1e293b 100%)' }} />

        {/* Profile Details Container */}
        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-16 mb-4">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl text-3xl font-black text-black ring-4 ring-black shadow-xl" style={{ backgroundColor: 'var(--accent)' }}>
              {user?.username?.[0]?.toUpperCase() || 'E'}
            </div>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-black"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Edit3 size={14} /> {isEditingBio ? 'Cancel Editing' : 'Edit Profile Info'}
            </button>
          </div>

          <div>
            <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{user?.username}</h1>
            <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{user?.headline || 'Enterprise Team Member'}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{user?.email} • {user?.organization?.name || 'Independent Enterprise'}</p>
          </div>

          {/* Edit Bio Drawer */}
          {isEditingBio ? (
            <div className="mt-4 space-y-3 rounded-xl p-4" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <label className="block mb-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Bio / Summary</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <button onClick={handleUpdateBio} className="rounded-xl px-4 py-2 text-xs font-bold text-black" style={{ backgroundColor: 'var(--accent)' }}>
                Save Profile Changes
              </button>
            </div>
          ) : (
            user?.bio && <p className="mt-4 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{user.bio}</p>
          )}
        </div>
      </div>

      {/* EMPLOYEE ORGANISATION LOCK BANNER */}
      <div className="rounded-2xl p-5 shadow-sm space-y-2" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 6%, transparent)', border: '1px solid var(--accent)' }}>
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Employee Organisation Lock Active</h3>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Your employment details (Designation, Internal ID, Salary, Department) are locked while employed at <strong>{user?.organization?.name || 'this organisation'}</strong>. Only HR or Organisation administrators can modify these fields.
        </p>

        {employment && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-xs">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Designation</p>
              <p className="font-bold text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>{employment.designation || 'Software Engineer'}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Department</p>
              <p className="font-bold text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>{employment.department}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Employee Code</p>
              <p className="font-bold text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>{employment.employeeCode || 'EMP-1002'}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Status</p>
              <p className="font-bold text-xs mt-0.5 text-green-400">{employment.employmentStatus || 'ACTIVE'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Experience & Education Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience */}
        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            <Briefcase size={16} /> Work Experience
          </h3>

          <div className="space-y-3 text-xs">
            {(profileData?.experiences || []).map((exp: any) => (
              <div key={exp.id} className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{exp.title}</p>
                <p className="text-[11px]" style={{ color: 'var(--accent)' }}>{exp.company}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{exp.description}</p>
              </div>
            ))}

            <form onSubmit={handleAddExperience} className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <input
                type="text"
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                placeholder="Title (e.g. Frontend Engineer)"
                className="w-full rounded-xl px-3 py-1.5 text-xs outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={expCompany}
                onChange={(e) => setExpCompany(e.target.value)}
                placeholder="Company (e.g. Google)"
                className="w-full rounded-xl px-3 py-1.5 text-xs outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <button type="submit" className="w-full rounded-xl py-1.5 text-xs font-bold text-black" style={{ backgroundColor: 'var(--accent)' }}>
                Add Experience
              </button>
            </form>
          </div>
        </div>

        {/* Endorsed Skills */}
        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            <Award size={16} /> Skills & Endorsements
          </h3>

          <div className="flex flex-wrap gap-2">
            {(profileData?.skills || []).map((s: any) => (
              <span key={s.id} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
                {s.skillName} ({s.endorsementCount || 1})
              </span>
            ))}
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Java, Next.js, Architecture)"
              className="w-full rounded-xl px-3 py-1.5 text-xs outline-none"
              style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
            <button type="submit" className="rounded-xl px-3 py-1.5 text-xs font-bold text-black flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
