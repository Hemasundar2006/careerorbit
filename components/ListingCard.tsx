import ShareButton from './ShareButton';
import Link from 'next/link';
import { CATEGORY_COLORS, daysLeft, formatDate, applicationStatus, type Post } from '@/lib/types';

export default function ListingCard({ post }: { post: Post }) {
  const left = daysLeft(post.lastDate);
  const opensIn = daysLeft(post.startDate);
  return (
    <article className="listing-card">
      <div className="card-topline">
        <span className={`category-badge ${CATEGORY_COLORS[post.category]}`}>{post.category}</span>
        <span className={`deadline-badge ${applicationStatus(post) === 'Closing Soon' ? 'urgent' : ''}`}>{applicationStatus(post)}</span>
      </div>
      <Link href={`/opportunities/${post.id}`} className="card-title-link"><h3>{post.title}</h3></Link>
      <p className="card-org">{post.organization}</p>
      <div className="eligibility-tags">{(post.eligibilityTags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="card-meta">
        <span><span className="meta-icon">⌖</span>{post.location}</span>
        <span><span className="meta-icon">◷</span>Apply by {formatDate(post.lastDate)}</span>
      </div>
      <div className="card-bottom">
        <span className="card-eligibility">{post.eligibility}</span>
        <ShareButton title={post.title} path={`/opportunities/${post.id}`} compact /><Link href={`/opportunities/${post.id}`} className="card-arrow" aria-label={`View ${post.title}`}>↗</Link>
      </div>
    </article>
  );
}
