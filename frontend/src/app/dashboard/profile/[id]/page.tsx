'use client';

import { useEffect, useState } from 'react';
import { UserCheck, Briefcase, GraduationCap, Award, FileText, Globe, MessageSquare, MapPin, Phone, Github, Linkedin, Link as LinkIcon, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userId = params.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-muted">Loading profile...</div>;
  }

  if (!profileData || !profileData.user) {
    return <div className="py-20 text-center text-xs text-red-400">Profile not found.</div>;
  }

  const user = profileData.user;
  const employment = profileData.employmentDetails;
  const experiences = profileData.experiences || [];
  const educations = profileData.educations || [];
  const skills = profileData.skills || [];
  const awards = profileData.awards || [];
  const certifications = profileData.certifications || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      {/* Cover & Profile Header Card */}
      <div className="overflow-hidden rounded-2xl shadow-sm relative" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {/* Cover Photo */}
        <div 
          className="h-40 w-full relative" 
          style={{ 
            background: user?.coverUrl ? `url(${user.coverUrl}) center/cover no-repeat` : 'linear-gradient(135deg, var(--accent) 0%, #1e293b 100%)' 
          }}
        />

        {/* Profile Details Container */}
        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-16 mb-4">
            <div 
              className="relative flex h-28 w-28 items-center justify-center rounded-2xl text-3xl font-black text-black ring-4 ring-black shadow-xl overflow-hidden" 
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() || 'E'
              )}
            </div>
            <button
              onClick={() => router.push(`/dashboard/messages?userId=${user.id}`)}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 bg-emerald-600 hover:bg-emerald-500"
            >
              <MessageSquare size={16} /> Direct Message
            </button>
          </div>

          <div>
            <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{user?.username}</h1>
            <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{user?.headline || 'Enterprise Team Member'}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{user?.email} • {user?.organization?.name || 'Independent Enterprise'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* About Section */}
        <div className="md:col-span-2 rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            <UserCheck size={16} /> About
          </h3>
          {user?.bio ? (
            <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
              {user.bio}
            </p>
          ) : (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No bio provided.</p>
          )}
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            Contact & Links
          </h3>
          <div className="space-y-3 text-xs">
            {user?.phone && <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Phone size={14} className="text-muted"/> {user.phone}</div>}
            {user?.location && <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><MapPin size={14} className="text-muted"/> {user.location}</div>}
            {user?.website && <div className="flex items-center gap-2 truncate" style={{ color: 'var(--text-primary)' }}><Globe size={14} className="text-muted"/> <a href={user.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{user.website}</a></div>}
            {user?.githubUrl && <div className="flex items-center gap-2 truncate" style={{ color: 'var(--text-primary)' }}><Github size={14} className="text-muted"/> <a href={user.githubUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">GitHub</a></div>}
            {user?.linkedinUrl && <div className="flex items-center gap-2 truncate" style={{ color: 'var(--text-primary)' }}><Linkedin size={14} className="text-muted"/> <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn</a></div>}
            {!user?.phone && !user?.location && !user?.website && !user?.githubUrl && !user?.linkedinUrl && (
              <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No contact info available.</p>
            )}
          </div>
        </div>
      </div>

      {employment && (
        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            <Building2 size={16} /> Employment Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Designation</p>
              <p className="font-bold text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>{employment.designation || 'Software Engineer'}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Department</p>
              <p className="font-bold text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>{employment.department}</p>
            </div>
          </div>
        </div>
      )}

      {/* Experience, Education, Skills, Awards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            <Briefcase size={16} /> Experience
          </h3>
          {experiences.length > 0 ? (
            <div className="space-y-4">
              {experiences.map((exp: any) => (
                <div key={exp.id} className="border-l-2 pl-3" style={{ borderColor: 'var(--border-subtle)' }}>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{exp.title} <span className="font-normal text-[10px]" style={{ color: 'var(--text-muted)' }}>at</span> {exp.company}</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No experience added.</p>
          )}
        </div>

        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            <GraduationCap size={16} /> Education & Skills
          </h3>
          
          <div className="mb-4">
            <h4 className="text-[10px] uppercase font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Top Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any) => (
                <span key={skill.id} className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                  {skill.name}
                </span>
              ))}
              {skills.length === 0 && <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No skills added.</span>}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Education</h4>
            {educations.length > 0 ? (
              <div className="space-y-3">
                {educations.map((edu: any) => (
                  <div key={edu.id}>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{edu.degree}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{edu.institution}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No education added.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
