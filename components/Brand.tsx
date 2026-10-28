import Link from 'next/link';

export default function Brand() {
  return (
    <Link href="/" className="brand" aria-label="CareerOrbit home">
      <span className="brand-mark" aria-hidden="true"><span /></span>
      <span>career<span className="brand-accent">orbit</span><span className="brand-dot">.</span></span>
    </Link>
  );
}
