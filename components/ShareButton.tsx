'use client';

import { useState } from 'react';

export default function ShareButton({ title = 'CareerOrbit — discover your next opportunity', path, compact = false }: { title?: string; path?: string; compact?: boolean }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState('');

  async function share() {
    setBusy(true);
    setStatus('');
    setFallbackUrl('');
    const url = path ? new URL(path, window.location.origin).href : window.location.href;
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
          setStatus('Shared successfully.');
          return;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return;
        }
      }
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      setStatus('Link copied!');
    } catch {
      setFallbackUrl(url);
      setStatus('Select and copy the link below.');
    } finally {
      setBusy(false);
    }
  }

  return <div className={`share-control${compact ? ' share-compact' : ''}`}>
    <button type="button" className="share-button" onClick={() => void share()} disabled={busy} aria-label={`Share ${title}`}><span aria-hidden="true">↗</span> {busy ? 'Sharing…' : 'Share'}</button>
    <span className="share-status" role="status">{status}</span>
    {fallbackUrl && <input className="share-link" aria-label="Shareable link" value={fallbackUrl} readOnly onFocus={(event) => event.currentTarget.select()} />}
  </div>;
}
