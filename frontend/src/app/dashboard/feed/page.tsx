'use client';

import { useEffect, useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, Send, Globe, Image as ImageIcon, Sparkles, UserPlus } from 'lucide-react';
import { fetchFeed, createPost, togglePostLike, addPostComment, fetchPostComments, fetchHrUsers, sendConnectionRequest } from '../api';

export default function LinkedInFeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, any[]>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<number, string>>({});
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await fetchFeed();
      setPosts(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch feed posts:', err);
      setPosts([]);
    }

    try {
      const usersRes = await fetchHrUsers();
      if (Array.isArray(usersRes?.data)) {
        setSuggestedUsers(usersRes.data.slice(0, 5));
      } else {
        setSuggestedUsers([]);
      }
    } catch (err) {
      setSuggestedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    try {
      await createPost({
        content: postContent,
        postType: mediaUrl ? 'IMAGE' : 'TEXT',
        mediaUrl: mediaUrl.trim() || undefined,
        visibility,
      });
      setPostContent('');
      setMediaUrl('');
      loadFeed();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const res = await togglePostLike(postId);
      setPosts(posts.map((p) => (p.id === postId ? res.data : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = async (postId: number) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      setActiveCommentPostId(postId);
      try {
        const res = await fetchPostComments(postId);
        setCommentsMap((prev) => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddComment = async (postId: number) => {
    const text = commentInputMap[postId];
    if (!text || !text.trim()) return;
    try {
      await addPostComment(postId, { content: text });
      setCommentInputMap((prev) => ({ ...prev, [postId]: '' }));
      const res = await fetchPostComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: res.data }));
      loadFeed();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (userId: number) => {
    try {
      await sendConnectionRequest(userId);
      alert('Connection request sent!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>LinkedIn Enterprise Feed</h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Connect with colleagues, publish organization updates, and interact across the network.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Feed Column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Post Creation Box */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold text-black" style={{ backgroundColor: 'var(--accent)' }}>
                  P
                </div>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Start a post... What's on your mind?"
                  rows={3}
                  className="w-full resize-none rounded-xl p-3 text-xs outline-none focus:ring-1"
                  style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Optional image/video URL..."
                    className="rounded-lg px-3 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="rounded-lg px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="ORGANISATION">Organisation Only</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!postContent.trim()}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-black transition disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <Send size={14} /> Post
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed List */}
          {loading ? (
            <div className="py-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Loading network feed...</div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl py-12 text-center text-xs" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              No posts found. Be the first to share an update with your network!
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="rounded-2xl p-5 shadow-sm transition hover:shadow-md" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                {/* Author Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-black" style={{ backgroundColor: 'var(--accent)' }}>
                      {post.author?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{post.author?.username}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {post.author?.organization?.name || 'Independent Enterprise'} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                    <Globe size={10} /> {post.visibility}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs leading-relaxed mb-4 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                  {post.content}
                </p>

                {/* Optional Media */}
                {post.mediaUrl && (
                  <div className="mb-4 overflow-hidden rounded-xl" style={{ border: '1px solid var(--border-subtle)' }}>
                    <img src={post.mediaUrl} alt="Post Attachment" className="max-h-96 w-full object-cover" />
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between border-t border-b py-2 my-2 text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 font-medium transition hover:text-[var(--accent)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <ThumbsUp size={15} /> Like ({post.likeCount || 0})
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 font-medium transition hover:text-[var(--accent)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <MessageSquare size={15} /> Comment ({post.commentCount || 0})
                  </button>
                  <button className="flex items-center gap-1.5 font-medium transition hover:text-[var(--accent)]" style={{ color: 'var(--text-muted)' }}>
                    <Share2 size={15} /> Share ({post.shareCount || 0})
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentPostId === post.id && (
                  <div className="mt-4 space-y-3 pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInputMap[post.id] || ''}
                        onChange={(e) => setCommentInputMap({ ...commentInputMap, [post.id]: e.target.value })}
                        placeholder="Add a comment..."
                        className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-black"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        Reply
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      {(commentsMap[post.id] || []).map((c) => (
                        <div key={c.id} className="rounded-xl p-3 text-xs" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                          <span className="font-bold" style={{ color: 'var(--accent)' }}>{c.author?.username}: </span>
                          <span style={{ color: 'var(--text-primary)' }}>{c.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sidebar Widgets (1 col) */}
        <div className="space-y-6">
          {/* Trending Hashtags Widget */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              <Sparkles size={14} /> Trending Enterprise Topics
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              <p className="font-medium hover:underline cursor-pointer" style={{ color: 'var(--text-primary)' }}>#TalentMobility2026</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>1,420 post discussions</p>
              <p className="font-medium hover:underline cursor-pointer" style={{ color: 'var(--text-primary)' }}>#WorkdayAnalytics</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>980 post discussions</p>
              <p className="font-medium hover:underline cursor-pointer" style={{ color: 'var(--text-primary)' }}>#RetentionRiskAI</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>740 post discussions</p>
            </div>
          </div>

          {/* Suggested Network Connections */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Suggested Connections</h3>
            <div className="mt-4 space-y-3">
              {suggestedUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{u.username}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{u.role}</p>
                  </div>
                  <button
                    onClick={() => handleConnect(u.id)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-black"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <UserPlus size={12} /> Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
