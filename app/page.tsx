'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Brand from '@/components/Brand';
import ShareButton from '@/components/ShareButton';
import ListingCard from '@/components/ListingCard';
import { api, CATEGORIES, CATEGORY_COLORS, type Category, type Post, type Stats } from '@/lib/types';

const blankStats: Stats = { total: 0, closingSoon: 0, byCategory: Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Stats['byCategory'] };

export default function Home() {
  const [stats, setStats] = useState<Stats>(blankStats);
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Category | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      const [postData, statsData] = await Promise.all([
        api<{ posts: Post[]; total: number; pages: number }>(`/api/posts?${params}`),
        api<Stats>('/api/stats'),
      ]);
      setPosts(postData.posts);
      setTotal(postData.total);
      setPages(postData.pages);
      setStats(statsData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load opportunities.');
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => { void load(); }, [load]);

  function chooseCategory(next: Category | '') {
    setCategory(next);
    setPage(1);
    document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' });
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
    document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <div className="hero-shell">
        <header className="site-header container">
          <Brand />
          <nav aria-label="Main navigation">
            <a href="#opportunities">Explore opportunities</a>
            <a href="#categories">Categories</a>
          </nav>
          <div className="header-actions"><ShareButton compact /><Link href="/admin" className="header-admin">Admin login <span>↗</span></Link></div>
        </header>

        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> ALL YOUR NEXT MOVES, ONE PLACE</div>
            <h1>Find the<br />opportunity <em>that moves you.</em></h1>
            <p>Government jobs, IT roles, internships, scholarships and hackathons. Discover what is open, know when it closes, and take your next step.</p>
            <form className="hero-search" onSubmit={submitSearch}>
              <span className="search-symbol" aria-hidden="true">⌕</span>
              <input aria-label="Search opportunities" placeholder="Search a role, organization or location" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
              <button type="submit">Search <span>↗</span></button>
            </form>
            <div className="hero-footnote"><span className="live-dot" /> Updated as new opportunities arrive <span className="footnote-divider">·</span> Deadlines shown in IST</div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
            <div className="hero-planet"><span>YOUR NEXT<br />CHAPTER</span><b>↗</b></div>
            <div className="floating-tile tile-top"><span className="tile-icon">✳</span><span>Explore more<br /><strong>possibilities</strong></span></div>
            <div className="floating-tile tile-bottom"><span className="tile-spark">✦</span><span>Good things<br /><strong>are ahead</strong></span></div>
            <span className="orbit-star star-one">✦</span><span className="orbit-star star-two">✳</span>
          </div>
        </section>
      </div>

      <main>
        <section className="stats-strip container" aria-label="Opportunity counts">
          <div><strong>{stats.total}</strong><span>Current listings</span></div>
          <div><strong>{stats.closingSoon}</strong><span>Closing in 7 days</span></div>
          <div><strong>{CATEGORIES.length}</strong><span>Categories to explore</span></div>
          <div className="stats-message">Your next step is<br /><em>closer than you think.</em></div>
        </section>

        <section className="category-section container" id="categories">
          <div className="section-intro"><div><span className="kicker">EXPLORE YOUR WAY</span><h2>A path for every ambition<span>.</span></h2></div><p>Choose what you are looking for. We will keep the list focused on opportunities that are still open.</p></div>
          <div className="category-grid">
            {CATEGORIES.map((item, index) => (
              <button className={`category-tile ${CATEGORY_COLORS[item]}`} key={item} onClick={() => chooseCategory(item)}>
                <span className="tile-number">0{index + 1}</span><span className="category-symbol">{['◈', '⌘', '✳', '↗', '✦', '✺'][index]}</span>
                <strong>{item}</strong><span className="category-count">{stats.byCategory[item]} open <span>→</span></span>
              </button>
            ))}
          </div>
        </section>

        <section className="opportunities-section" id="opportunities">
          <div className="container">
            <div className="section-intro opportunities-intro"><div><span className="kicker">THE LATEST OPENINGS</span><h2>Open doors, right now<span>.</span></h2></div><p>Every listing is active and links directly to the official application page.</p></div>
            <div className="listing-layout">
              <aside className="filter-panel" aria-label="Filter opportunities">
                <div className="filter-title"><strong>Filter by category</strong><span>⌄</span></div>
                <button className={`filter-option ${!category ? 'selected' : ''}`} onClick={() => chooseCategory('')}><span>All opportunities</span><b>{stats.total}</b></button>
                {CATEGORIES.map((item) => <button key={item} className={`filter-option ${category === item ? 'selected' : ''}`} onClick={() => chooseCategory(item)}><span>{item}</span><b>{stats.byCategory[item]}</b></button>)}
                <div className="filter-note"><span>✦</span><p>Listings automatically leave the site after their application deadline.</p></div>
              </aside>
              <div className="listing-content">
                <div className="listing-toolbar"><div><strong>{loading ? 'Loading...' : `${total} ${total === 1 ? 'opportunity' : 'opportunities'}`}</strong><span>{category ? ` in ${category}` : ' available now'}{search ? ` matching “${search}”` : ''}</span></div>{(category || search) && <button className="clear-filters" onClick={() => { setCategory(''); setSearch(''); setSearchInput(''); setPage(1); }}>Clear filters ×</button>}</div>
                {error ? <div className="empty-state"><span>!</span><h3>Could not load opportunities</h3><p>{error}</p><button onClick={() => void load()}>Try again</button></div> : loading ? <div className="loading-grid"><div /><div /><div /><div /></div> : posts.length ? <div className="listing-grid">{posts.map((post) => <ListingCard key={post.id} post={post} />)}</div> : <div className="empty-state"><span>✦</span><h3>No opportunities here yet</h3><p>{search || category ? 'Try another search or category.' : 'Fresh opportunities will appear here as soon as the admin adds them.'}</p>{(search || category) && <button onClick={() => { setCategory(''); setSearch(''); setSearchInput(''); }}>View all opportunities</button>}</div>}
                {pages > 1 && <div className="pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>← Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button></div>}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><div><Brand /><p>One place for the opportunities that shape what comes next.</p></div><div><a href="#opportunities">Browse opportunities</a><Link href="/admin">Admin</Link></div><span>© {new Date().getFullYear()} CareerOrbit</span></div></footer>
    </>
  );
}
