'use client';

import { useEffect, useState } from 'react';
import { fetchNetworkSuggestions, sendConnectionRequest, toggleFollow } from '../api';
import { UserPlus, UserCheck, Check, Building2, User } from 'lucide-react';

export default function NetworkPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const res = await fetchNetworkSuggestions();
      setSuggestions(res.data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (user: any) => {
    setPendingIds((prev) => new Set(prev).add(user.id));
    try {
      if (user.role === 'ORGANISATION') {
        await toggleFollow(user.id);
        // Optimistically update connected status
        setSuggestions((prev) => prev.map(u => u.id === user.id ? { ...u, connected: true } : u));
      } else {
        await sendConnectionRequest(user.id);
        setSuggestions((prev) => prev.map(u => u.id === user.id ? { ...u, connectionRequested: true } : u));
      }
    } catch (err) {
      console.error('Action failed:', err);
      alert('Action failed. Please try again.');
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    }
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-500">Loading network suggestions...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Colleagues & Organizations</h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Discover and connect with professionals, or follow organizations to stay updated.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No suggestions available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-3 gap-6">
          {suggestions.map((user) => (
            <div key={user.id} className="rounded-2xl shadow-sm overflow-hidden flex flex-col relative" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {/* Background Cover */}
              <div className="h-16" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}></div>
              
              {/* Avatar */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-4 overflow-hidden flex items-center justify-center font-bold text-xl text-black bg-white" style={{ borderColor: 'var(--bg-surface)', backgroundColor: user.avatarUrl ? 'transparent' : 'var(--accent)' }}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user.username?.[0]?.toUpperCase() || 'U'
                )}
              </div>

              {/* Info */}
              <div className="pt-10 pb-4 px-4 text-center flex-grow flex flex-col">
                <a href={`/dashboard/profile/${user.id}`} className="font-bold text-sm hover:underline" style={{ color: 'var(--text-primary)' }}>
                  {user.username}
                </a>
                <p className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--text-muted)', minHeight: '32px' }}>
                  {user.headline || (user.role === 'ORGANISATION' ? 'Organization' : 'Professional')}
                </p>
                {user.organization && user.role !== 'ORGANISATION' && (
                  <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user.organization}
                  </p>
                )}
                
                <div className="mt-4 mt-auto">
                  {user.connected ? (
                    <button disabled className="w-full py-1.5 rounded-full flex justify-center items-center gap-2 text-xs font-semibold bg-gray-100 text-gray-500 cursor-not-allowed">
                      <UserCheck size={14} /> {user.role === 'ORGANISATION' ? 'Following' : 'Connected'}
                    </button>
                  ) : user.connectionRequested ? (
                    <button disabled className="w-full py-1.5 rounded-full flex justify-center items-center gap-2 text-xs font-semibold bg-green-100 text-green-700 cursor-not-allowed">
                      <Check size={14} /> Sent
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction(user)}
                      disabled={pendingIds.has(user.id)}
                      className="w-full py-1.5 rounded-full border flex justify-center items-center gap-2 text-xs font-bold transition hover:bg-black/5"
                      style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                    >
                      {pendingIds.has(user.id) ? 'Processing...' : user.role === 'ORGANISATION' ? (
                        <><Building2 size={14} /> Follow</>
                      ) : (
                        <><UserPlus size={14} /> Connect</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
