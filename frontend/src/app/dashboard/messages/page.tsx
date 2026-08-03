'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, MessageSquare, Search, Building2, UserCheck, ShieldCheck } from 'lucide-react';
import { fetchHrProfile, fetchHrUsers, fetchMessages, sendMessage } from '../api';

interface HrContact {
  id: number;
  username: string;
  role: string;
  organization: string | object | null;
  avatarUrl?: string | null;
  isOnline?: boolean;
}

interface MessageItem {
  id: number;
  sender: { id: number; username: string };
  recipient: { id: number; username: string };
  content: string;
  createdAt: string;
}

// Generates consistent avatar color for each HR user
const getAvatarColor = (name: string) => {
  const colors = [
    'from-emerald-500 to-teal-700 text-white',
    'from-blue-500 to-indigo-700 text-white',
    'from-purple-500 to-pink-700 text-white',
    'from-amber-500 to-orange-700 text-white',
    'from-cyan-500 to-blue-700 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const initialRecipientId = searchParams.get('recipientId') ? Number(searchParams.get('recipientId')) : null;

  const [profiles, setProfiles] = useState<HrContact[]>([]);
  const [threads, setThreads] = useState<MessageItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(initialRecipientId);
  const [searchQuery, setSearchQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const selectedIdRef = useRef<number | null>(selectedId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const loadData = () => {
    Promise.all([fetchHrUsers(), fetchMessages(), fetchHrProfile()])
      .then(([usersRes, messagesRes, profileRes]) => {
        setProfiles(usersRes.data);
        setThreads(messagesRes.data);
        if (profileRes.data?.id) setMyUserId(profileRes.data.id);

        if (selectedIdRef.current === null && usersRes.data.length > 0) {
          const defaultId = initialRecipientId && usersRes.data.some((u: any) => u.id === initialRecipientId)
            ? initialRecipientId
            : usersRes.data[0].id;
          setSelectedId(defaultId);
          selectedIdRef.current = defaultId;
        }
      })
      .catch(() => {
        setProfiles([]);
        setThreads([]);
      });
  };

  useEffect(() => {
    loadData();
    // Real-time auto polling every 3 seconds for new messages
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [initialRecipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, selectedId]);

  const getOrgName = (org: any): string => {
    if (!org) return '';
    if (typeof org === 'string') return org;
    if (typeof org === 'object' && org.name) return String(org.name);
    return String(org);
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchName = (p.username || '').toLowerCase().includes(query);
      const matchOrg = getOrgName(p.organization).toLowerCase().includes(query);
      const matchRole = (p.role || '').toLowerCase().includes(query);
      return matchName || matchOrg || matchRole;
    });
  }, [profiles, searchQuery]);

  const selectedProfile = useMemo(() => profiles.find((p) => p.id === selectedId), [profiles, selectedId]);
  const currentThread = useMemo(
    () => threads.filter((m) => m.sender?.id === selectedId || m.recipient?.id === selectedId),
    [threads, selectedId]
  );

  const handleSendMessage = async () => {
    if (!draft.trim() || !selectedId) return;
    try {
      const res = await sendMessage({ recipientId: selectedId, content: draft.trim() });
      setThreads((prev) => [...prev, res.data]);
      setDraft('');
    } catch {
      /* ignore */
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFormattedDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (msgDate.getTime() === today.getTime()) return 'Today';
    if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-3xl border border-emerald-500/20 bg-card p-6 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-500">
                Secure HR Network
              </span>
              <ShieldCheck size={16} className="text-emerald-500" />
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">Private HR Messaging</h1>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              Connect and chat securely with verified HR professionals across partner organizations.
            </p>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-600 dark:text-emerald-400">
            <MessageSquare size={18} />
            <span className="text-xs font-bold">{profiles.length} Active HR Contacts</span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Sidebar: HR Contacts */}
        <aside className="flex flex-col rounded-3xl border border-emerald-500/20 bg-card p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-foreground">HR Contacts</h2>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500">
              {filteredProfiles.length} Online
            </span>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3.5 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search HR by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-emerald-500/20 bg-background pl-10 pr-4 py-2.5 text-xs text-foreground outline-none transition placeholder:text-muted focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Contacts List */}
          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {filteredProfiles.map((profile) => {
              const isActive = profile.id === selectedId;
              const orgName = getOrgName(profile.organization);
              const avatarStyle = getAvatarColor(profile.username || 'HR');

              return (
                <button
                  key={profile.id}
                  onClick={() => setSelectedId(profile.id)}
                  className={`flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-all ${
                    isActive
                      ? 'border border-emerald-500/30 bg-emerald-500/10 shadow-sm'
                      : 'border border-transparent hover:bg-emerald-500/5'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.username}
                        className="h-11 w-11 rounded-2xl object-cover border border-emerald-500/30 shadow-md"
                      />
                    ) : (
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarStyle} text-sm font-extrabold shadow-md`}
                      >
                        {(profile.username || 'HR').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${profile.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-bold text-foreground">{profile.username}</p>
                      {profile.isOnline ? (
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-500 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted/10 border border-muted/20 px-1.5 py-0.5 text-[9px] font-bold text-muted flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          Offline
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted flex items-center gap-1 mt-0.5">
                      <Building2 size={12} className="text-emerald-500 flex-shrink-0" />
                      {orgName || 'Independent HR'}
                    </p>
                  </div>
                </button>
              );
            })}
            {filteredProfiles.length === 0 && (
              <div className="py-12 text-center text-xs text-muted">
                No HR contacts match &quot;{searchQuery}&quot;.
              </div>
            )}
          </div>
        </aside>

        {/* Chat Conversation Panel */}
        <section className="flex flex-col rounded-3xl border border-emerald-500/20 bg-card p-5 sm:p-6 shadow-lg min-h-[560px]">
          {selectedProfile ? (
            <>
              {/* Active Contact Header */}
              <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative flex-shrink-0">
                    {selectedProfile.avatarUrl ? (
                      <img
                        src={selectedProfile.avatarUrl}
                        alt={selectedProfile.username}
                        className="h-12 w-12 rounded-2xl object-cover border border-emerald-500/30 shadow-md"
                      />
                    ) : (
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarColor(
                          selectedProfile.username
                        )} text-sm font-extrabold shadow-md`}
                      >
                        {(selectedProfile.username || 'HR').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${selectedProfile.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-foreground">{selectedProfile.username}</h2>
                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                      <span>{selectedProfile.role || 'HR Professional'}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {getOrgName(selectedProfile.organization) || 'Independent HR'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedProfile.isOnline ? (
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-500">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span>Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-full border border-muted/20 bg-muted/10 px-3 py-1 text-xs font-semibold text-muted">
                      <span className="h-2 w-2 rounded-full bg-gray-400" />
                      <span>Offline</span>
                    </div>
                  )}
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <UserCheck size={14} />
                    <span>Verified HR</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages History */}
              <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-emerald-500/10 bg-background/60 p-4 max-h-[380px] min-h-[300px]">
                {currentThread.length > 0 ? (
                  currentThread.map((message, index) => {
                    const isMine = myUserId ? message.sender?.id === myUserId : message.sender?.id !== selectedId;
                    const dateLabel = getFormattedDateLabel(message.createdAt);
                    const prevDateLabel = index > 0 ? getFormattedDateLabel(currentThread[index - 1].createdAt) : null;
                    const showDateHeader = dateLabel && dateLabel !== prevDateLabel;

                    return (
                      <div key={message.id || index} className="space-y-3">
                        {showDateHeader && (
                          <div className="my-4 flex items-center justify-center">
                            <span className="rounded-full border border-emerald-500/20 bg-card px-3.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shadow-xs">
                              {dateLabel}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className="flex flex-col max-w-[80%] sm:max-w-[70%]">
                            <div
                              className={`rounded-2xl px-4 py-3 text-sm shadow-sm transition ${
                                isMine
                                  ? 'bg-emerald-600 text-white font-medium rounded-tr-xs shadow-emerald-900/10'
                                  : 'bg-card border border-emerald-500/20 text-foreground font-medium rounded-tl-xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                            </div>
                            <span
                              className={`mt-1 text-[10px] font-semibold tracking-wide ${
                                isMine ? 'text-right text-emerald-600 dark:text-emerald-400' : 'text-left text-muted'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-16 text-center text-xs text-muted space-y-2">
                    <MessageSquare size={32} className="text-emerald-500/30 mb-1" />
                    <p className="font-semibold">No messages yet with {selectedProfile.username}.</p>
                    <p>Send a message below to start your private HR conversation!</p>
                  </div>
                )}

                {/* Animated Typing Indicator Symbol when user is typing */}
                {draft.trim().length > 0 && (
                  <div className="flex justify-end my-2 animate-fade-in">
                    <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-500 font-semibold shadow-xs">
                      <span>Typing...</span>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Composer Input Bar */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Write a message to ${selectedProfile.username}...`}
                    className="flex-1 rounded-2xl border border-emerald-500/20 bg-background px-4 py-3.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!draft.trim()}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 shadow-md shadow-emerald-600/20"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <span className="text-[11px] text-muted self-end pr-1">Press Enter to send</span>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center text-muted space-y-3 p-6">
              <MessageSquare size={40} className="text-emerald-500/30 mb-2" />
              {profiles.length > 0 ? (
                <p className="text-sm font-semibold">Select an HR contact from the left list to begin messaging.</p>
              ) : (
                <div className="max-w-md space-y-2">
                  <p className="text-sm font-bold text-foreground">No Other HR Accounts Registered Yet</p>
                  <p className="text-xs text-muted">
                    To test messaging between HR accounts, register a second HR user in an Incognito window! Once registered, their account will instantly appear in your HR Contacts list here.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
