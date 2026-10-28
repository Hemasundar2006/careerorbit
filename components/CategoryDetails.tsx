import type { Category, Post, PostDetails } from '@/lib/types';

type DetailField = { key: keyof PostDetails; label: string };

const FIELDS: Partial<Record<Category, DetailField[]>> = {
  Internship: [
    { key: 'stipend', label: 'STIPEND / PAY' },
    { key: 'duration', label: 'DURATION' },
    { key: 'workType', label: 'WORK TYPE' },
    { key: 'joiningDate', label: 'EXPECTED JOINING' },
    { key: 'skills', label: 'PREFERRED SKILLS' },
  ],
  Hackathon: [
    { key: 'theme', label: 'THEME / PROBLEM STATEMENT' },
    { key: 'teamSize', label: 'TEAM SIZE' },
    { key: 'prize', label: 'PRIZES / BENEFITS' },
    { key: 'eventDate', label: 'EVENT / FINALE DATE' },
  ],
  Scholarship: [
    { key: 'awardAmount', label: 'SCHOLARSHIP AMOUNT' },
    { key: 'incomeLimit', label: 'FAMILY INCOME LIMIT' },
    { key: 'academicYear', label: 'ACADEMIC YEAR' },
    { key: 'studyLevel', label: 'STUDY LEVEL' },
  ],
};

export default function CategoryDetails({ post }: { post: Post }) {
  const rows = (FIELDS[post.category] || []).filter(({ key }) => post.details?.[key]);
  if (!rows.length) return null;
  return <section className="detail-section">
    <h2>{post.category} details</h2>
    <div className="detail-data-grid">
      {rows.map(({ key, label }) => <div key={key}><small>{label}</small><strong>{post.details[key]}</strong></div>)}
    </div>
  </section>;
}
