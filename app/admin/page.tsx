'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Brand from '@/components/Brand';
import { api, CATEGORIES, CATEGORY_COLORS, daysLeft, formatDate, type Post, type PostInput, type Stats } from '@/lib/types';

const EMPTY_POST: PostInput = {
  title: '', category: 'Central Govt Job', organization: '', location: '', eligibility: '', ageLimit: '',
  startDate: '', lastDate: '', importantDates: '', applicationFee: '', applyLink: '', notificationLink: '',
};

type Admin = { email: string };

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [view, setView] = useState<'overview' | 'form'>('overview');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PostInput>(EMPTY_POST);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      const [postData, statsData] = await Promise.all([
        api<{ posts: Post[] }>('/api/admin/posts'), api<Stats>('/api/stats'),
      ]);
      setPosts(postData.posts);
      setStats(statsData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load dashboard.');
    }
  }, []);

  useEffect(() => {
    api<{ admin: Admin }>('/api/auth/me').then((data) => {
      setAdmin(data.admin);
      void loadDashboard();
    }).catch(() => {}).finally(() => setChecking(false));
  }, [loadDashboard]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const data = await api<{ admin: Admin }>('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      setAdmin(data.admin); setPassword('');
      await loadDashboard();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not sign in.'); }
    finally { setBusy(false); }
  }

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAdmin(null); setPosts([]); setStats(null); setView('overview');
  }

  function startCreate() {
    setEditingId(null); setDraft({ ...EMPTY_POST }); setError(''); setNotice(''); setView('form');
  }

  function startEdit(post: Post) {
    const { id, createdAt, ...fields } = post;
    void id; void createdAt;
    setEditingId(post.id); setDraft(fields); setError(''); setNotice(''); setView('form');
  }

  function change<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function savePost(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      await api(`/api/admin/posts${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      setView('overview'); setEditingId(null); setDraft({ ...EMPTY_POST });
      await loadDashboard();
      setNotice(editingId ? 'Post updated successfully.' : 'Post published successfully.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save post.'); }
    finally { setBusy(false); }
  }

  async function deletePost(post: Post) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await api(`/api/admin/posts/${post.id}`, { method: 'DELETE' });
      await loadDashboard();
      setNotice('Post deleted.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not delete post.'); }
    finally { setBusy(false); }
  }

  if (checking) return <div className="admin-loading">Loading admin workspace...</div>;

  if (!admin) return <div className="login-page"><div className="login-brand"><Brand /><Link href="/">← Back to website</Link></div><div className="login-card"><div className="login-emblem">✳</div><span className="kicker">ADMIN ACCESS</span><h1>Welcome back<span>.</span></h1><p>Sign in to create and manage opportunities.</p><form onSubmit={login}><label>Email address<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="admin@example.com" /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Enter your password" /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="login-submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in to dashboard'} <span>↗</span></button></form></div><div className="login-aside"><span className="aside-star">✦</span><div><span>CAREERORBIT ADMIN</span><h2>Good opportunities deserve to be seen.</h2><p>Publish once. Help someone find their next move.</p></div></div></div>;

  return <div className="admin-app">
    <aside className="admin-sidebar"><Brand /><div className="sidebar-caption">WORKSPACE</div><button className={`sidebar-link ${view === 'overview' ? 'active' : ''}`} onClick={() => setView('overview')}><span>▦</span> Overview</button><button className={`sidebar-link ${view === 'form' ? 'active' : ''}`} onClick={startCreate}><span>＋</span> Create post</button><div className="sidebar-spacer" /><Link href="/" className="sidebar-link"><span>↗</span> View public site</Link><button className="sidebar-link" onClick={logout}><span>⇥</span> Sign out</button><div className="sidebar-user"><span>{admin.email.slice(0, 1).toUpperCase()}</span><div><strong>Administrator</strong><small>{admin.email}</small></div></div></aside>
    <main className="admin-main">
      <header className="admin-topbar"><div><span className="kicker">ADMIN WORKSPACE</span><h1>{view === 'form' ? (editingId ? 'Edit opportunity' : 'Create opportunity') : 'Overview'}<span>.</span></h1></div><div className="admin-top-actions"><Link href="/" target="_blank">View site ↗</Link>{view === 'overview' && <button className="admin-primary" onClick={startCreate}>＋ Create new post</button>}</div></header>
      {notice && <div className="form-success" role="status">✦ {notice}</div>}
      {error && <div className="form-error" role="alert">{error}</div>}
      {view === 'overview' ? <>
        <section className="admin-stat-grid"><div className="admin-stat"><span>ACTIVE POSTS</span><strong>{stats?.total ?? posts.length}</strong><small>Visible on the public site ↗</small></div><div className="admin-stat"><span>CLOSING SOON</span><strong>{stats?.closingSoon ?? 0}</strong><small>Within the next 7 days</small></div><div className="admin-stat"><span>CATEGORIES</span><strong>{CATEGORIES.length}</strong><small>Across all opportunities</small></div></section>
        <section className="admin-table-section"><div className="admin-section-head"><div><span className="kicker">MANAGE LISTINGS</span><h2>Published opportunities <span>({posts.length})</span></h2></div><button onClick={() => void loadDashboard()} className="refresh-button">↻ Refresh</button></div>{posts.length ? <div className="admin-table-wrap"><table><thead><tr><th>OPPORTUNITY</th><th>CATEGORY</th><th>DEADLINE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{posts.map((post) => <tr key={post.id}><td><strong>{post.title}</strong><small>{post.organization} · {post.location}</small></td><td><span className={`category-badge ${CATEGORY_COLORS[post.category]}`}>{post.category}</span></td><td>{formatDate(post.lastDate)}</td><td><span className="status-open"><i /> {daysLeft(post.startDate) > 0 ? 'Upcoming' : 'Open'}</span></td><td><div className="table-actions"><button onClick={() => startEdit(post)}>Edit</button><button className="delete-action" disabled={busy} onClick={() => void deletePost(post)}>Delete</button></div></td></tr>)}</tbody></table></div> : <div className="admin-empty"><span>✳</span><h3>No posts yet</h3><p>Create your first opportunity to make it visible on the public website.</p><button className="admin-primary" onClick={startCreate}>＋ Create first post</button></div>}</section>
        <section className="admin-category-section"><h2>Posts by category</h2><div className="admin-category-grid">{CATEGORIES.map((category) => <div key={category}><span className={`category-badge ${CATEGORY_COLORS[category]}`}>{category}</span><strong>{stats?.byCategory[category] ?? 0}</strong></div>)}</div></section>
      </> : <div className="admin-form-layout"><form className="post-form" onSubmit={savePost}><div className="form-section-heading"><span>01</span><div><h2>Basic details</h2><p>Make it easy for visitors to know what this opportunity is.</p></div></div><div className="form-grid"><label className="full">Post title <b>*</b><input value={draft.title} onChange={(event) => change('title', event.target.value)} required maxLength={180} placeholder="e.g. RRB Station Master Recruitment 2026" /></label><label>Category <b>*</b><select value={draft.category} onChange={(event) => change('category', event.target.value as PostInput['category'])}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label><label>Organization / host <b>*</b><input value={draft.organization} onChange={(event) => change('organization', event.target.value)} required placeholder="e.g. APPSC, Amazon, AICTE" /></label><label>Location / mode <b>*</b><input value={draft.location} onChange={(event) => change('location', event.target.value)} required placeholder="e.g. Hyderabad, Pan-India, Remote" /></label><label>Eligibility / qualification <b>*</b><input value={draft.eligibility} onChange={(event) => change('eligibility', event.target.value)} required placeholder="e.g. B.Tech 2024–2026" /></label><label className="full">Age limit <b>*</b><input value={draft.ageLimit} onChange={(event) => change('ageLimit', event.target.value)} required placeholder="e.g. 18–30 years, relaxations as applicable" /></label></div><div className="form-section-heading"><span>02</span><div><h2>Dates and fee</h2><p>Posts automatically leave the public site after the last date.</p></div></div><div className="form-grid"><label>Start date <b>*</b><input type="date" value={draft.startDate} onChange={(event) => change('startDate', event.target.value)} required /></label><label>Last date to apply <b>*</b><input type="date" value={draft.lastDate} min={draft.startDate || undefined} onChange={(event) => change('lastDate', event.target.value)} required /></label><label className="full">Important dates <span>(optional)</span><textarea value={draft.importantDates} onChange={(event) => change('importantDates', event.target.value)} rows={3} placeholder="e.g. Exam: 12 Dec 2026 · Results: 20 Jan 2027" /></label><label className="full">Application fee <b>*</b><input value={draft.applicationFee} onChange={(event) => change('applicationFee', event.target.value)} required placeholder="e.g. General ₹500, SC/ST ₹250 or Free / ₹0" /></label></div><div className="form-section-heading"><span>03</span><div><h2>Official links</h2><p>Only HTTPS links to official sources are accepted.</p></div></div><div className="form-grid"><label className="full">Official apply link <b>*</b><input type="url" value={draft.applyLink} onChange={(event) => change('applyLink', event.target.value)} required placeholder="https://official-portal.example/apply" /></label><label className="full">Notification PDF link <span>(optional)</span><input type="url" value={draft.notificationLink} onChange={(event) => change('notificationLink', event.target.value)} placeholder="https://official-portal.example/notification.pdf" /></label></div><div className="form-buttons"><button type="button" className="cancel-button" onClick={() => { setView('overview'); setError(''); }}>Cancel</button><button className="admin-primary" type="submit" disabled={busy}>{busy ? 'Saving...' : editingId ? 'Save changes →' : 'Publish opportunity →'}</button></div></form><aside className="form-aside"><div className="form-aside-icon">✦</div><h3>Before you publish</h3><p>Check the deadline and make sure the apply link goes to the official registration page.</p><div className="form-aside-note">Expired listings are hidden automatically at midnight IST after their last date and then removed from MongoDB.</div></aside></div>}
    </main>
  </div>;
}
