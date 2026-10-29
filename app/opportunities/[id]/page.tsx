'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Brand from '@/components/Brand';
import ShareButton from '@/components/ShareButton';
import CategoryDetails from '@/components/CategoryDetails';
import { api, CATEGORY_COLORS, daysLeft, formatDate, type Post } from '@/lib/types';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    api<{ post: Post }>(`/api/posts/${encodeURIComponent(id)}`)
      .then((data) => { if (current) setPost(data.post); })
      .catch((cause) => { if (current) setError(cause instanceof Error ? cause.message : 'Could not load this opportunity.'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [id]);

  return <div className="detail-page">
    <header className="inner-header"><div className="container inner-header-content"><Brand /><Link href="/" className="back-link">← Back to all opportunities</Link></div></header>
    <main className="container detail-main">
      {loading ? <div className="detail-loading">Loading opportunity...</div> : error || !post ? <div className="detail-error"><span>✦</span><h1>Opportunity unavailable</h1><p>{error || 'This listing may have passed its deadline.'}</p><Link className="primary-link" href="/">Browse open opportunities →</Link></div> : <>
        <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/#opportunities">Opportunities</Link><span>/</span><span>{post.category}</span></nav>
        <div className="detail-layout">
          <article className="detail-article">
            <div className="detail-heading"><span className={`category-badge ${CATEGORY_COLORS[post.category]}`}>{post.category}</span><h1>{post.title}</h1><p>Posted by <strong>{post.organization}</strong></p></div>
            <div className="detail-section"><h2>Opportunity overview</h2><div className="detail-data-grid"><div><small>ORGANIZATION / HOST</small><strong>{post.organization}</strong></div><div><small>LOCATION / MODE</small><strong>{post.location}</strong></div><div><small>ELIGIBILITY / QUALIFICATION</small><strong>{post.eligibility}</strong></div>{post.ageLimit && post.ageLimit !== 'Not specified' && <div><small>AGE LIMIT</small><strong>{post.ageLimit}</strong></div>}<div><small>{post.category === 'Hackathon' ? 'REGISTRATION FEE' : 'APPLICATION FEE'}</small><strong>{post.applicationFee}</strong></div></div></div>
            <CategoryDetails post={post} />
            <div className="detail-section"><h2>Important dates</h2><div className="dates-row"><div><span className="date-symbol">↗</span><small>{post.category === 'Hackathon' ? 'REGISTRATION OPENS' : 'APPLICATION OPENS'}</small><strong>{formatDate(post.startDate)}</strong></div><div><span className="date-symbol">◷</span><small>{post.category === 'Hackathon' ? 'REGISTRATION CLOSES' : 'LAST DATE TO APPLY'}</small><strong>{formatDate(post.lastDate)}</strong></div></div>{post.importantDates && <div className="important-note"><strong>Other important dates</strong><p>{post.importantDates}</p></div>}</div>
            {post.notificationLink && <div className="detail-section"><h2>Official document</h2><p className="detail-help">Review the official document before applying.</p><a className="notification-link" href={post.notificationLink} target="_blank" rel="noopener noreferrer">Open {post.category === 'Hackathon' ? 'rules' : post.category === 'Scholarship' ? 'guidelines' : 'notification'} PDF ↗</a></div>}
          </article>
          <aside className="apply-panel"><div className="apply-panel-top"><span className="live-dot" /> {daysLeft(post.startDate) > 0 ? 'APPLICATION OPENS SOON' : 'APPLICATION OPEN'}</div><h2>Ready to take the next step?</h2><p>Apply through the official {post.organization} website.</p><div className="apply-deadline"><small>DEADLINE</small><strong>{formatDate(post.lastDate)}</strong><span>{daysLeft(post.lastDate) === 0 ? 'Closes today' : `${daysLeft(post.lastDate)} days remaining`}</span></div><a className="apply-button" href={post.applyLink} target="_blank" rel="noopener noreferrer">{daysLeft(post.startDate) > 0 ? 'Visit official site' : 'Apply on official site'} <span>↗</span></a><ShareButton title={post.title} path={`/opportunities/${post.id}`} /><small className="external-note">You will be taken to the official application page.</small></aside>
        </div>
      </>}
    </main>
    <footer className="detail-footer container"><span>CareerOrbit · Opportunities for what comes next.</span><Link href="/">Explore more →</Link></footer>
  </div>;
}
