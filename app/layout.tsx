import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CareerOrbit | Jobs, internships, scholarships & hackathons',
  description: 'Find verified opportunities in one place. Browse jobs, internships, hackathons and scholarships before their deadlines.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
