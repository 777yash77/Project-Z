'use client';

import { useEffect, useState } from 'react';
import { Briefcase, Building2, MapPin, Search, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';
import { getMe, fetchAllOpenJobs, applyToJob, fetchMyJobApplications } from '../api';

export default function JobsPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'my-applications'
  
  // Data States
  const [jobs, setJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const userRes = await getMe();
      const user = userRes.data;
      setUserInfo(user);

      const [jobsRes, myAppsRes] = await Promise.all([
        fetchAllOpenJobs().catch(() => ({ data: [] })),
        fetchMyJobApplications().catch(() => ({ data: [] }))
      ]);
      setJobs(jobsRes.data || []);
      setMyApplications(myAppsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (jobId: number) => {
    try {
      await applyToJob(jobId);
      alert('Successfully applied!');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to apply');
    }
  };

  if (!userInfo) return <div className="p-8 text-center text-sm opacity-50">Loading Jobs...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Internal Job Board</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Explore internal recruitment opportunities and apply for open roles across the enterprise.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <button onClick={() => setActiveTab('browse')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'browse' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`} style={{ borderColor: activeTab === 'browse' ? 'var(--accent)' : 'transparent', color: activeTab === 'browse' ? 'var(--accent)' : 'var(--text-primary)' }}>
          <Search size={16} /> Browse Jobs
        </button>
        <button onClick={() => setActiveTab('my-applications')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'my-applications' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`} style={{ borderColor: activeTab === 'my-applications' ? 'var(--accent)' : 'transparent', color: activeTab === 'my-applications' ? 'var(--accent)' : 'var(--text-primary)' }}>
          <Briefcase size={16} /> My Applications
        </button>
      </div>

      <div className="mt-6">
        {/* TAB: BROWSE JOBS (EMPLOYEE) */}
        {activeTab === 'browse' && (
          <div className="grid gap-6 md:grid-cols-2">
            {jobs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No open jobs available at the moment.</div>
            ) : (
              jobs.map(job => {
                const hasApplied = myApplications.some(app => app.jobPosting.id === job.id);
                return (
                  <div key={job.id} className="rounded-2xl border p-5 transition hover:shadow-lg flex flex-col h-full" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{job.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><Building2 size={12} /> {job.organization?.name}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-4 text-xs leading-relaxed whitespace-pre-wrap line-clamp-3" style={{ color: 'var(--text-muted)' }}>{job.description}</p>
                      
                      {job.skillsRequired && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.skillsRequired.split(',').map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      {hasApplied ? (
                        <button disabled className="w-full rounded-xl py-2.5 text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 cursor-not-allowed flex items-center justify-center gap-2">
                          <CheckCircle size={14} /> Applied
                        </button>
                      ) : (
                        <button onClick={() => handleApply(job.id)} className="w-full rounded-xl py-2.5 text-xs font-bold text-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--accent)' }}>
                          Apply Now <ArrowUpRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB: MY APPLICATIONS (EMPLOYEE) */}
        {activeTab === 'my-applications' && (
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6" style={{ color: 'var(--text-primary)' }}>My Job Applications</h3>
            <div className="space-y-4">
              {myApplications.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>You haven't applied to any jobs yet.</div>
              ) : (
                myApplications.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{app.jobPosting.title}</h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{app.jobPosting.organization?.name} • Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--bg-card)] border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--accent)' }}>
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
