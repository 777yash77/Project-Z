'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, MessageCircleMore, UserCircle2, Search, Building2 } from 'lucide-react';
import { fetchHrUsers, fetchMessages, sendMessage } from '../api';

interface HrContact {
  id: number;
  username: string;
  role: string;
  organization: string | null;
}

interface MessageItem {
  id: number;
  sender: { id: number; username: string };
  recipient: { id: number; username: string };
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const initialRecipientId = searchParams.get('recipientId') ? Number(searchParams.get('recipientId')) : null;

  const [profiles, setProfiles] = useState<HrContact[]>([]);
  const [threads, setThreads] = useState<MessageItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(initialRecipientId);
  const [searchQuery, setSearchQuery] = useState('');
  const [draft, setDraft] = useState('');

  useEffect(() => {
    Promise.all([fetchHrUsers(), fetchMessages()]).then(([usersRes, messagesRes]) => {
      setProfiles(usersRes.data);
      setThreads(messagesRes.data);
      if (initialRecipientId && usersRes.data.some((u: any) => u.id === initialRecipientId)) {
        setSelectedId(initialRecipientId);
      } else if (usersRes.data.length && !selectedId) {
        setSelectedId(usersRes.data[0].id);
      }
    }).catch(() => { setProfiles([]); setThreads([]); });
  }, [initialRecipientId]);

  // Filtered HR contacts
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchName = p.username.toLowerCase().includes(query);
      const matchOrg = (p.organization || '').toLowerCase().includes(query);
      const matchRole = (p.role || '').toLowerCase().includes(query);
      return matchName || matchOrg || matchRole;
    });
  }, [profiles, searchQuery]);

  const selectedProfile = useMemo(() => profiles.find((p) => p.id === selectedId), [profiles, selectedId]);
  const currentThread = useMemo(() => threads.filter((m) => m.sender.id === selectedId || m.recipient.id === selectedId), [threads, selectedId]);

  const handleSendMessage = async () => {
    if (!draft.trim() || !selectedId) return;
    try {
      const res = await sendMessage({ recipientId: selectedId, content: draft.trim() });
      setThreads((prev) => [...prev, res.data]);
      setDraft('');
    } catch { /* ignore */ }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border border-green-500/12 bg-[#060e09] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400/50">Cross-HR Messaging</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Private HR Conversations</h1>
            <p className="mt-1 text-sm text-green-100/35">Search and chat directly with HR professionals across all partner organizations.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-green-500/15 bg-green-500/8 px-4 py-2.5">
            <MessageCircleMore size={15} className="text-green-400" />
            <span className="text-sm text-green-100/40">{profiles.length} Total HR Contacts</span>
          </div>
        </div>
      </div>

      {/* Chat layout */}
      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        {/* Contacts sidebar */}
        <aside className="rounded-2xl border border-green-500/10 bg-[#060e09] p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400/40">HR Contacts</h2>
            <span className="text-[10px] text-green-100/30">{filteredProfiles.length} available</span>
          </div>

          {/* Search Bar for HRs */}
          <div className="flex items-center gap-2 rounded-xl border border-green-500/15 bg-black/40 px-3 py-2 text-xs">
            <Search size={14} className="text-green-400" />
            <input
              type="text"
              placeholder="Search HR by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white outline-none placeholder:text-green-100/20 w-full"
            />
          </div>

          {/* HR Contacts List */}
          <div className="space-y-2 overflow-y-auto max-h-[480px]">
            {filteredProfiles.map((profile) => {
              const isActive = profile.id === selectedId;
              return (
                <button
                  key={profile.id}
                  onClick={() => setSelectedId(profile.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? 'border border-green-500/20 bg-green-500/8'
                      : 'border border-transparent hover:bg-green-500/4'
                  }`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-sm font-bold text-green-400">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{profile.username}</p>
                    <p className="truncate text-[11px] text-green-100/30 flex items-center gap-1">
                      <Building2 size={11} className="text-green-400 flex-shrink-0" />
                      {profile.organization || 'Independent HR'}
                    </p>
                  </div>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400 shadow-[0_0_6px_rgba(0,255,136,0.8)]" />}
                </button>
              );
            })}
            {filteredProfiles.length === 0 && (
              <p className="py-8 text-center text-xs text-green-100/20">No HR professionals found matching &quot;{searchQuery}&quot;.</p>
            )}
          </div>
        </aside>

        {/* Chat area */}
        <section className="flex flex-col rounded-2xl border border-green-500/10 bg-[#060e09] p-5" style={{ minHeight: '500px' }}>
          {selectedProfile ? (
            <>
              {/* Chat header */}
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-500/8 bg-black/30 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-sm font-bold text-green-400">
                  {selectedProfile.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{selectedProfile.username}</p>
                  <p className="text-xs text-green-100/30">{selectedProfile.role} · {selectedProfile.organization || 'Independent HR'}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(0,255,136,0.8)]" />
                  <span className="text-[10px] text-green-400/50">Active HR Contact</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-green-500/6 bg-black/20 p-4" style={{ maxHeight: '320px' }}>
                {currentThread.length > 0 ? currentThread.map((message) => {
                  const isMine = message.sender.id !== selectedId;
                  return (
                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMine
                          ? 'bg-green-500/15 text-green-100'
                          : 'bg-black/50 border border-green-500/8 text-green-100/70'
                      }`}>
                        <p>{message.content}</p>
                        <p className={`mt-1 text-[10px] ${isMine ? 'text-green-400/40' : 'text-green-100/20'}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex h-full items-center justify-center text-xs text-green-100/20">
                    No messages yet with {selectedProfile.username}. Send a message to start the conversation!
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="mt-4 flex items-end gap-3">
                <textarea
                  id="message-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Write a message to ${selectedProfile.username}... (Enter to send)`}
                  className="min-h-[72px] flex-1 resize-none rounded-xl border border-green-500/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-green-100/20 focus:border-green-500/30 focus:ring-2 focus:ring-green-500/8"
                />
                <button
                  id="send-message-btn"
                  onClick={handleSendMessage}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-black transition hover:bg-green-400 hover:shadow-[0_0_16px_rgba(0,255,136,0.4)]"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-green-500/10 text-center">
              <div>
                <UserCircle2 size={36} className="mx-auto mb-3 text-green-500/20" />
                <p className="text-sm text-green-100/20">Select an HR contact to start chatting.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
