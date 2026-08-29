'use client';

import { useEffect, useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ThumbsUp, MessageSquare, Share2, Send, Globe, Image as ImageIcon, Sparkles, UserPlus, X, Check, UserCheck, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { fetchFeed, createPost, togglePostLike, addPostComment, fetchPostComments, fetchHrUsers, sendConnectionRequest, getBase64, sharePost, getMe, deletePost, editPost } from '../api';

export default function LinkedInFeedPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, any[]>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<number, string>>({});
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMenuForPost, setShowMenuForPost] = useState<number | null>(null);
  
  // Crop states
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCrop(undefined);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target?.result?.toString() || '');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const finalizeCrop = () => {
    if (!completedCrop || !imgRef.current) return;
    
    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    
    setMediaUrl(canvas.toDataURL('image/jpeg', 0.9));
    setImgSrc('');
  };

  const loadFeed = async () => {
    setLoading(true);
    try {
      const userRes = await getMe();
      setUserInfo(userRes.data);
    } catch (err) {
      console.error(err);
    }

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
    if (!postContent.trim() && !mediaUrl) return;
    try {
      await createPost({
        content: postContent,
        postType: mediaUrl ? (mediaUrl.startsWith('data:video') ? 'VIDEO' : 'IMAGE') : 'TEXT',
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
    // Optimistic Update
    setPosts((prev) => prev.map((p) => {
      if (p.id === postId) {
        return { 
          ...p, 
          likeCount: p.likedByMe ? Math.max(0, (p.likeCount || 1) - 1) : (p.likeCount || 0) + 1,
          likedByMe: !p.likedByMe 
        };
      }
      return p;
    }));
    try {
      const res = await togglePostLike(postId);
      // Actual server response overrides optimistic
      setPosts((prev) => prev.map((p) => (p.id === postId ? res.data : p)));
    } catch (err) {
      console.error(err);
      loadFeed(); // revert on failure
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
      // Optimistically update comment count in the feed list
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (postId: number) => {
    try {
      const res = await sharePost(postId);
      setPosts(posts.map((p) => (p.id === postId ? res.data : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (userId: number) => {
    // Optimistically update UI
    setPendingConnections((prev) => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });
    try {
      await sendConnectionRequest(userId);
    } catch (err) {
      console.error(err);
      // Revert on error
      setPendingConnections((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleEditClick = (post: any) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    setShowMenuForPost(null);
  };

  const handleSaveEdit = async (postId: number) => {
    try {
      const res = await editPost(postId, { content: editContent });
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, content: res.data.content } : p)));
      setEditingPostId(null);
      setEditContent('');
    } catch (err) {
      console.error(err);
      alert('Failed to edit post');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setShowMenuForPost(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete post');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Crop Modal */}
      {imgSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-5 shadow-2xl space-y-4 max-w-2xl w-full" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Crop Image</h3>
              <button onClick={() => setImgSrc('')} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex justify-center max-h-[60vh] overflow-auto">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img 
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop me"
                  style={{ maxHeight: '60vh', objectFit: 'contain' }}
                />
              </ReactCrop>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={finalizeCrop}
                disabled={!completedCrop?.width || !completedCrop?.height}
                className="px-4 py-2 rounded-xl text-xs font-bold text-black"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs outline-none transition hover:bg-black/5" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                    <ImageIcon size={14} className={mediaUrl && mediaUrl.startsWith('data:image') ? "text-green-500" : ""} /> Image
                  </button>
                  <label className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs outline-none transition hover:bg-black/5 cursor-pointer" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                    <Globe size={14} className={mediaUrl && mediaUrl.startsWith('data:video') ? "text-green-500" : ""} /> Video
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (e) => setMediaUrl(e.target?.result?.toString() || '');
                        reader.readAsDataURL(file);
                      }} 
                    />
                  </label>
                  {mediaUrl && (
                    <div className="relative group flex items-center justify-center bg-black/10 rounded overflow-hidden h-8 w-8" style={{ border: '1px solid var(--border-subtle)' }}>
                      {mediaUrl.startsWith('data:video') ? (
                        <video src={mediaUrl} className="h-full w-full object-cover" />
                      ) : (
                        <img src={mediaUrl} alt="Preview" className="h-full w-full object-cover" />
                      )}
                      <button type="button" onClick={() => setMediaUrl('')} className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10">
                        <X size={10} />
                      </button>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />

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
                  disabled={!postContent.trim() && !mediaUrl}
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
                <div className="flex items-start justify-between mb-3 relative">
                  <div className="flex items-center gap-3">
                    <a href={`/dashboard/profile/${post.author?.id}`} className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-black overflow-hidden hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--accent)' }}>
                      {post.author?.avatarUrl ? (
                         <img src={post.author.avatarUrl} alt={post.author.username} className="w-full h-full object-cover" />
                      ) : (
                         post.author?.username?.[0]?.toUpperCase() || 'U'
                      )}
                    </a>
                    <div>
                      <a href={`/dashboard/profile/${post.author?.id}`} className="text-xs font-bold hover:underline" style={{ color: 'var(--text-primary)' }}>{post.author?.username}</a>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {post.author?.organization?.name || 'Independent Enterprise'} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                      <Globe size={10} /> {post.visibility}
                    </span>
                    
                    {/* Post Actions Menu (Edit/Delete) */}
                    {userInfo?.id === post.author?.id && (
                      <div className="relative">
                        <button onClick={() => setShowMenuForPost(showMenuForPost === post.id ? null : post.id)} className="p-1 rounded-full hover:bg-[var(--bg-base)] transition-colors" style={{ color: 'var(--text-muted)' }}>
                          <MoreVertical size={16} />
                        </button>
                        {showMenuForPost === post.id && (
                          <div className="absolute right-0 mt-1 w-32 rounded-xl shadow-lg border py-1 z-10" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                            <button onClick={() => handleEditClick(post)} className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-[var(--bg-base)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                              <Edit2 size={14} /> Edit
                            </button>
                            <button onClick={() => handleDeletePost(post.id)} className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                {editingPostId === post.id ? (
                  <div className="mb-4 space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors text-xs"
                      rows={4}
                      style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingPostId(null)} className="px-4 py-2 text-xs font-semibold rounded-xl border hover:bg-[var(--bg-base)] transition-colors" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                        Cancel
                      </button>
                      <button onClick={() => handleSaveEdit(post.id)} className="px-4 py-2 text-xs font-semibold rounded-xl text-black hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--accent)' }}>
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed mb-4 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                    {post.content}
                  </p>
                )}

                {/* Optional Media */}
                {post.mediaUrl && (
                  <div className="mb-4 overflow-hidden rounded-xl" style={{ border: '1px solid var(--border-subtle)' }}>
                    {post.postType === 'VIDEO' ? (
                      <video src={post.mediaUrl} controls className="max-h-96 w-full object-cover bg-black" />
                    ) : (
                      <img src={post.mediaUrl} alt="Post Attachment" className="max-h-96 w-full object-cover" />
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between border-t border-b py-2 my-2 text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 font-medium transition"
                    style={{ color: post.likedByMe ? 'var(--accent)' : 'var(--text-muted)' }}
                  >
                    <ThumbsUp size={15} fill={post.likedByMe ? 'currentColor' : 'none'} /> Like ({post.likeCount || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 font-medium transition hover:text-[var(--accent)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <MessageSquare size={15} /> Comment ({post.commentCount || 0})
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1.5 font-medium transition hover:text-[var(--accent)]" 
                    style={{ color: 'var(--text-muted)' }}
                  >
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
                <div key={u.id} className="flex items-center justify-between text-xs gap-3">
                  <a href={`/dashboard/profile/${u.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full font-bold text-black flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                       {u.avatarUrl ? (
                         <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                       ) : (
                         u.username?.[0]?.toUpperCase() || 'U'
                       )}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{u.username}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{u.role}</p>
                    </div>
                  </a>
                  {u.connected ? (
                    <button
                      disabled
                      className="flex items-center justify-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-black bg-gray-500/20 cursor-not-allowed border"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <UserCheck size={10} /> Connected
                    </button>
                  ) : pendingConnections.has(u.id) || u.connectionRequested ? (
                    <button
                      disabled
                      className="flex items-center justify-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white bg-green-600/80 cursor-not-allowed border-none"
                    >
                      <Check size={10} /> Sent
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(u.id)}
                      className="flex items-center justify-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-black"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      <UserPlus size={10} /> Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
