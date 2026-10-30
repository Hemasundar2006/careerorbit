import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CareerOrbit | Jobs, internships, scholarships & hackathons',
  description: 'Find verified opportunities in one place. Browse jobs, internships, hackathons and scholarships before their deadlines.',
  keywords: ['government jobs', 'private jobs', 'internships', 'hackathons', 'scholarships', 'India opportunities'],
  openGraph: { title: 'CareerOrbit | Find your next opportunity', description: 'Browse open jobs, internships, scholarships and hackathons before their deadlines.', type: 'website' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
