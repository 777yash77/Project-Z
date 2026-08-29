'use client';

import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Sparkles, ArrowUpRight, Building2, MessageCircleMore, Briefcase, UserSearch } from 'lucide-react';
import { fetchTradeListings, fetchMyOrgJobs, fetchOpenCandidates, fetchJobApplications, createJobPosting } from '../api';

interface TradeListingItem {
  id: number;
  employee: { id: number; name: string; department: string; riskLevel: string; riskScore: number };
  organization: { name: string };
  listedBy?: { id: number; username: string };
  commissionPercent: string;
  notes: string;
  status: string;
}

export default function HireWindowPage() {
  const [activeTab, setActiveTab] = useState('trade-listings'); // 'trade-listings', 'manage-jobs', 'scout-candidates'
  
  const [employees, setEmployees] = useState<TradeListingItem[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  // Job Posting Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');

  const loadData = async () => {
    try {
      const [tradeRes, jobsRes, candidatesRes] = await Promise.all([
        fetchTradeListings().catch(() => ({ data: [] })),
        fetchMyOrgJobs().catch(() => ({ data: [] })),
        fetchOpenCandidates().catch(() => ({ data: [] }))
      ]);
      setEmployees(Array.isArray(tradeRes?.data) ? tradeRes.data : []);
      setMyJobs(jobsRes?.data || []);
      setCandidates(candidatesRes?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openProfiles = useMemo(() => employees.filter((e) => e.status === 'OPEN'), [employees]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJobPosting({ title, description, skillsRequired: skills });
      setTitle('');
      setDescription('');
      setSkills('');
      loadData();
      alert('Job Posting Created successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const loadApplications = async (jobId: number) => {
    try {
      const res = await fetchJobApplications(jobId);
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in mx-auto max-w-6xl">
      {/* Header */}
      <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Recruitment & Scouting</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Hire & Manage Roles</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Review open trades, publish new internal jobs, and proactively scout talent.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
            <Sparkles size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{openProfiles.length}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>ready to review</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <button onClick={() => setActiveTab('trade-listings')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'trade-listings' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`} style={{ borderColor: activeTab === 'trade-listings' ? 'var(--accent)' : 'transparent', color: activeTab === 'trade-listings' ? 'var(--accent)' : 'var(--text-primary)' }}>
          <BriefcaseBusiness size={16} /> Open Trades
        </button>
        <button onClick={() => setActiveTab('manage-jobs')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'manage-jobs' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`} style={{ borderColor: activeTab === 'manage-jobs' ? 'var(--accent)' : 'transparent', color: activeTab === 'manage-jobs' ? 'var(--accent)' : 'var(--text-primary)' }}>
          <Briefcase size={16} /> Manage Job Postings
        </button>
        <button onClick={() => setActiveTab('scout-candidates')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'scout-candidates' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`} style={{ borderColor: activeTab === 'scout-candidates' ? 'var(--accent)' : 'transparent', color: activeTab === 'scout-candidates' ? 'var(--accent)' : 'var(--text-primary)' }}>
          <UserSearch size={16} /> Scout Candidates
        </button>
      </div>

      <div className="mt-6">
        {/* TAB: TRADE LISTINGS */}
        {activeTab === 'trade-listings' && (
          <div>
            {openProfiles.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {openProfiles.map((employee) => (
                  <div key={employee.id} className="group rounded-2xl border p-5 transition hover:shadow-lg" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
                    {/* Top */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-base" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}>
                        {employee.employee.name.charAt(0)}
                      </div>
                      <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}>
                        Hire-ready
                      </span>
                    </div>

                    {/* Name & dept */}
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>{employee.employee.department}</p>
                      <h2 className="mt-1 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{employee.employee.name}</h2>
                    </div>

                    {/* Stats */}
                    <div className="mt-5 rounded-xl border p-3 text-xs" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                      {[
                        { label: 'Risk Level', value: employee.employee.riskLevel, color: employee.employee.riskLevel === 'High' ? '#ef4444' : employee.employee.riskLevel === 'Medium' ? '#f59e0b' : 'var(--accent)' },
                        { label: 'Risk Score', value: employee.employee.riskScore.toFixed(2), color: 'var(--text-primary)' },
                        { label: 'Commission', value: `${employee.commissionPercent}%`, color: 'var(--accent)' },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                          <span className="font-semibold" style={{ color: row.color }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Organization */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Building2 size={11} />
                      Listed by {employee.organization.name}
                    </div>

                    {/* CTA buttons */}
                    <div className="mt-4 flex items-center gap-2">
                      {employee.listedBy?.id && (
                        <a
                          href={`/dashboard/messages?recipientId=${employee.listedBy.id}`}
                          className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition hover:opacity-90"
                          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}
                        >
                          <MessageCircleMore size={14} />
                        </a>
                      )}
                      <button
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition hover:opacity-90"
                        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}
                      >
                        <BriefcaseBusiness size={14} />
                        Review Candidate
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed py-20 text-center" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
                <BriefcaseBusiness size={36} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No hire-ready profiles yet.</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Open employees for trade from the Employee Directory.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: MANAGE JOBS (HR / ORG) */}
        {activeTab === 'manage-jobs' && (
          <div className="space-y-8">
            {/* Create Job Form (Full Width Layout) */}
            <div className="rounded-2xl p-8 shadow-sm border space-y-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                <Briefcase size={20} /> Create New Job Posting
              </h3>
              <form onSubmit={handleCreateJob} className="space-y-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>Job Title</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" className="w-full rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block mb-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>Required Skills (comma separated)</label>
                    <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Java, React, SQL" className="w-full rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>Detailed Description</label>
                  <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and team..." className="w-full rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <button type="submit" className="w-fit px-8 rounded-xl py-3 font-bold text-black text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--accent)' }}>Publish Job Posting</button>
              </form>
            </div>

            {/* List of My Jobs */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Active Job Postings</h3>
              {myJobs.length === 0 ? (
                <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>You haven't posted any jobs yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {myJobs.map(job => (
                    <div key={job.id} className="rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{job.title}</h4>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Posted on {new Date(job.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => loadApplications(job.id)} className="text-xs font-bold px-4 py-2 rounded-lg border hover:bg-[var(--bg-card)] transition-colors" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                          View Applications
                        </button>
                      </div>
                      
                      {/* Inline Applications View */}
                      {applications.length > 0 && applications[0].jobPosting.id === job.id && (
                        <div className="mt-5 pt-5 border-t space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
                          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Applicants ({applications.length})</p>
                          {applications.map(app => (
                            <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center font-bold text-[10px]" style={{ color: 'var(--accent)' }}>
                                  {app.applicant?.avatarUrl ? <img src={app.applicant.avatarUrl} className="w-full h-full rounded-full object-cover" /> : app.applicant?.username?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{app.applicant?.username}</p>
                                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{app.applicant?.email}</p>
                                </div>
                              </div>
                              <span className="text-xs font-bold px-2 py-1 rounded bg-[var(--bg-card)]">{app.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SCOUT CANDIDATES (HR / ORG) */}
        {activeTab === 'scout-candidates' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm flex items-center gap-2">
              <UserSearch size={18} />
              These employees have toggled "Open for Work" on their profile. Reach out if their skills match your needs.
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {candidates.length === 0 ? (
                <div className="col-span-full py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No candidates are currently open to work.</div>
              ) : (
                candidates.map(candidate => (
                  <div key={candidate.id} className="rounded-2xl border p-5 flex flex-col" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}>
                        {candidate.avatarUrl ? <img src={candidate.avatarUrl} className="w-full h-full rounded-2xl object-cover" /> : candidate.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-lg truncate" style={{ color: 'var(--text-primary)' }}>{candidate.name}</h4>
                        <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{candidate.headline || 'Enterprise Employee'}</p>
                        <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--accent)' }}>{candidate.currentOrganization}</p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Verified Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills && candidate.skills.length > 0 ? (
                          candidate.skills.map((skill: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                              {skill.skillName}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] italic text-[var(--text-muted)]">No skills listed</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      <a href={`/dashboard/messages?recipientId=${candidate.id}`} className="w-full block text-center rounded-xl py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--accent)' }}>
                        Message Candidate
                      </a>
                    </div>
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
