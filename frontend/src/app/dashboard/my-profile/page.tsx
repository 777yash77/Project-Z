'use client';

import { useEffect, useState, useRef } from 'react';
import { Lock, UserCheck, Briefcase, GraduationCap, Award, FileText, Globe, Edit3, Plus, PlusCircle, Camera, MessageSquare, ThumbsUp } from 'lucide-react';
import { fetchMyProfile, updateBio, addExperience, addEducation, addSkill, addDocument, getBase64, addAward, addCertification, fetchMyPosts } from '../api';

export default function MyEnterpriseProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);

  // New Experience State
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Awards State
  const [awardTitle, setAwardTitle] = useState('');
  const [awardIssuer, setAwardIssuer] = useState('');

  // Certifications State
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');

  // My Posts
  const [myPosts, setMyPosts] = useState<any[]>([]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatarUrl' | 'coverUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const base64 = await getBase64(file, 800);
      await updateBio({ [type]: base64 });
      await loadProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const [res, postsRes] = await Promise.all([
        fetchMyProfile(),
        fetchMyPosts().catch(() => ({ data: [] }))
      ]);
      setProfileData(res.data);
      setHeadline(res.data.user?.headline || '');
      setBio(res.data.user?.bio || '');
      setPhone(res.data.user?.phone || '');
      setLocation(res.data.user?.location || '');
      setWebsite(res.data.user?.website || '');
      setGithubUrl(res.data.user?.githubUrl || '');
      setLinkedinUrl(res.data.user?.linkedinUrl || '');
      setMyPosts(postsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateBio = async () => {
    try {
      await updateBio({ headline, bio, phone, location, website, githubUrl, linkedinUrl });
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

  const handleAddAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardTitle || !awardIssuer) return;
    try {
      await addAward({ title: awardTitle, issuer: awardIssuer });
      setAwardTitle('');
      setAwardIssuer('');
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName || !certOrg) return;
    try {
      await addCertification({ name: certName, issuingOrganization: certOrg });
      setCertName('');
      setCertOrg('');
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
      <div className="overflow-hidden rounded-2xl shadow-sm relative group" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {/* Cover Photo */}
        <div 
          onClick={() => coverInputRef.current?.click()}
          className="h-40 w-full relative cursor-pointer group-hover:opacity-90 transition-opacity" 
          style={{ 
            background: user?.coverUrl ? `url(${user.coverUrl}) center/cover no-repeat` : 'linear-gradient(135deg, var(--accent) 0%, #1e293b 100%)' 
          }}
        >
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Camera className="text-white opacity-80" size={32} />
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-16 mb-4">
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="group/avatar relative flex h-28 w-28 cursor-pointer items-center justify-center rounded-2xl text-3xl font-black text-black ring-4 ring-black shadow-xl overflow-hidden" 
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() || 'E'
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center">
                 <Camera className="text-white mb-1" size={20} />
                 <span className="text-[9px] text-white font-bold tracking-wider uppercase">Upload</span>
              </div>
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
          {isEditingBio && (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl px-3 py-2 text-xs outline-none" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl px-3 py-2 text-xs outline-none" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Website</label>
                  <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full rounded-xl px-3 py-2 text-xs outline-none" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>GitHub URL</label>
                  <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full rounded-xl px-3 py-2 text-xs outline-none" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>LinkedIn URL</label>
                  <input type="text" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="w-full rounded-xl px-3 py-2 text-xs outline-none" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <button onClick={handleUpdateBio} className="w-full rounded-xl px-4 py-2 text-xs font-bold text-black flex items-center justify-center gap-2 mt-2" style={{ backgroundColor: 'var(--accent)' }}>
                {isUploading ? 'Uploading...' : 'Save Profile Changes'}
              </button>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatarUrl')} />
          <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'coverUrl')} />
        </div>
      </div>

      {/* About / Bio Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            <UserCheck size={16} /> About Me
          </h3>
          {user?.bio ? (
            <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
              {user.bio}
            </p>
          ) : (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No bio provided yet. Click 'Edit Profile Info' above to add one.</p>
          )}
        </div>

        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            Contact & Links
          </h3>
          <div className="space-y-3 text-xs">
            {user?.phone && <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><strong>Phone:</strong> {user.phone}</div>}
            {user?.location && <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><strong>Location:</strong> {user.location}</div>}
            {user?.website && <div className="flex items-center gap-2 truncate" style={{ color: 'var(--text-primary)' }}><strong>Website:</strong> <a href={user.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{user.website}</a></div>}
            {user?.githubUrl && <div className="flex items-center gap-2 truncate" style={{ color: 'var(--text-primary)' }}><strong>GitHub:</strong> <a href={user.githubUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Link</a></div>}
            {user?.linkedinUrl && <div className="flex items-center gap-2 truncate" style={{ color: 'var(--text-primary)' }}><strong>LinkedIn:</strong> <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Link</a></div>}
            {!user?.phone && !user?.location && !user?.website && !user?.githubUrl && !user?.linkedinUrl && (
              <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No contact info added.</p>
            )}
          </div>
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

      {/* Awards & Certifications Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Awards */}
        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            <Award size={16} /> Honors & Awards
          </h3>

          <div className="space-y-3 text-xs">
            {(profileData?.awards || []).map((award: any) => (
              <div key={award.id} className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{award.title}</p>
                <p className="text-[11px]" style={{ color: 'var(--accent)' }}>{award.issuer}</p>
              </div>
            ))}

            <form onSubmit={handleAddAward} className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <input
                type="text"
                value={awardTitle}
                onChange={(e) => setAwardTitle(e.target.value)}
                placeholder="Award Title (e.g. Employee of the Month)"
                className="w-full rounded-xl px-3 py-1.5 text-xs outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={awardIssuer}
                onChange={(e) => setAwardIssuer(e.target.value)}
                placeholder="Issuer (e.g. HR Department)"
                className="w-full rounded-xl px-3 py-1.5 text-xs outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <button type="submit" className="w-full rounded-xl py-1.5 text-xs font-bold text-black" style={{ backgroundColor: 'var(--accent)' }}>
                Add Award
              </button>
            </form>
          </div>
        </div>

        {/* Certifications */}
        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            <GraduationCap size={16} /> Certifications
          </h3>

          <div className="space-y-3 text-xs">
            {(profileData?.certifications || []).map((cert: any) => (
              <div key={cert.id} className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{cert.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--accent)' }}>{cert.issuingOrganization}</p>
              </div>
            ))}

            <form onSubmit={handleAddCertification} className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <input
                type="text"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                placeholder="Certification Name (e.g. AWS Certified)"
                className="w-full rounded-xl px-3 py-1.5 text-xs outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={certOrg}
                onChange={(e) => setCertOrg(e.target.value)}
                placeholder="Issuing Organization (e.g. Amazon)"
                className="w-full rounded-xl px-3 py-1.5 text-xs outline-none"
                style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <button type="submit" className="w-full rounded-xl py-1.5 text-xs font-bold text-black" style={{ backgroundColor: 'var(--accent)' }}>
                Add Certification
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* My Posts Section */}
      <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
          <MessageSquare size={16} /> My Recent Posts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myPosts.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              You haven't published any posts yet.
            </div>
          ) : (
            myPosts.map((post) => (
              <div key={post.id} className="rounded-xl p-4 transition hover:shadow-md" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-xs leading-relaxed mb-3 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                  {post.content}
                </p>
                {post.mediaUrl && (
                  <div className="mb-3 overflow-hidden rounded-lg" style={{ border: '1px solid var(--border-subtle)' }}>
                    <img src={post.mediaUrl} alt="Post Attachment" className="w-full h-32 object-cover" />
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><ThumbsUp size={12} /> {post.likeCount || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
