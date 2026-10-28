export const CATEGORIES = [
  'Central Govt Job',
  'State Govt Job',
  'Private/IT Job',
  'Internship',
  'Hackathon',
  'Scholarship',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type PostDetails = {
  stipend?: string;
  duration?: string;
  workType?: string;
  skills?: string;
  joiningDate?: string;
  theme?: string;
  teamSize?: string;
  prize?: string;
  eventDate?: string;
  awardAmount?: string;
  incomeLimit?: string;
  academicYear?: string;
  studyLevel?: string;
};

export type Post = {
  id: string;
  title: string;
  category: Category;
  organization: string;
  location: string;
  eligibility: string;
  ageLimit: string;
  startDate: string;
  lastDate: string;
  importantDates: string;
  applicationFee: string;
  applyLink: string;
  notificationLink: string;
  details: PostDetails;
  createdAt: string;
};

export type PostInput = Omit<Post, 'id' | 'createdAt'>;

export type Stats = {
  total: number;
  closingSoon: number;
  byCategory: Record<Category, number>;
};

export const CATEGORY_COLORS: Record<Category, string> = {
  'Central Govt Job': 'blue',
  'State Govt Job': 'purple',
  'Private/IT Job': 'teal',
  Internship: 'orange',
  Hackathon: 'pink',
  Scholarship: 'green',
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
    .format(new Date(`${value}T12:00:00+05:30`));
}

export function daysLeft(value: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || '';
  const todayInIndia = `${part('year')}-${part('month')}-${part('day')}`;
  const today = Date.parse(`${todayInIndia}T00:00:00Z`);
  const last = Date.parse(`${value}T00:00:00Z`);
  return Math.max(0, Math.round((last - today) / 86400000));
}

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed. Please try again.');
  return data as T;
}
