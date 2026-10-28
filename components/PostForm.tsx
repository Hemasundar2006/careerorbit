'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { CATEGORIES, type Category, type PostDetails, type PostInput } from '@/lib/types';

type FormProps = {
  draft: PostInput;
  setDraft: Dispatch<SetStateAction<PostInput>>;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  busy: boolean;
  editing: boolean;
};

type DetailKey = keyof PostDetails;
type ExtraField = { key: DetailKey; label: string; placeholder: string; full?: boolean };

const EXTRA_FIELDS: Partial<Record<Category, ExtraField[]>> = {
  Internship: [
    { key: 'stipend', label: 'Stipend / pay', placeholder: 'e.g. ₹15,000 per month or Unpaid' },
    { key: 'duration', label: 'Duration', placeholder: 'e.g. 3 months' },
    { key: 'workType', label: 'Work type', placeholder: 'e.g. Full-time, Part-time' },
    { key: 'joiningDate', label: 'Expected joining date', placeholder: 'e.g. January 2027' },
    { key: 'skills', label: 'Preferred skills', placeholder: 'e.g. Python, communication, Figma', full: true },
  ],
  Hackathon: [
    { key: 'theme', label: 'Theme / problem statement', placeholder: 'e.g. AI for social impact', full: true },
    { key: 'teamSize', label: 'Team size', placeholder: 'e.g. 2–4 members' },
    { key: 'prize', label: 'Prizes / benefits', placeholder: 'e.g. ₹1 lakh prize pool' },
    { key: 'eventDate', label: 'Event / finale date', placeholder: 'e.g. 12–14 December 2026', full: true },
  ],
  Scholarship: [
    { key: 'awardAmount', label: 'Scholarship amount', placeholder: 'e.g. ₹50,000 per year' },
    { key: 'incomeLimit', label: 'Family income limit', placeholder: 'e.g. Below ₹8 lakh per year' },
    { key: 'academicYear', label: 'Academic year', placeholder: 'e.g. 2026–27' },
    { key: 'studyLevel', label: 'Study level', placeholder: 'e.g. Class 12, UG, PG' },
  ],
};

function SectionHeading({ number, title, help }: { number: string; title: string; help: string }) {
  return <div className="form-section-heading"><span>{number}</span><div><h2>{title}</h2><p>{help}</p></div></div>;
}

export default function PostForm({ draft, setDraft, onSave, onCancel, busy, editing }: FormProps) {
  const job = draft.category.includes('Job');
  const extra = EXTRA_FIELDS[draft.category] || [];
  const kind = job ? 'job' : draft.category.toLowerCase();
  const organizationLabel = job ? 'Organization / recruiting board' : draft.category === 'Internship' ? 'Company / organization' : draft.category === 'Hackathon' ? 'Host / organizer' : 'Scholarship provider / sponsor';
  const locationLabel = draft.category === 'Internship' ? 'Work location / mode' : draft.category === 'Hackathon' ? 'Venue / mode' : draft.category === 'Scholarship' ? 'Eligible region / location' : 'Location / mode';
  const eligibilityLabel = draft.category === 'Hackathon' ? 'Who can participate' : draft.category === 'Scholarship' ? 'Eligibility / qualification' : draft.category === 'Internship' ? 'Who can apply / eligible batch' : 'Eligibility / qualification';
  const lastDateLabel = draft.category === 'Hackathon' ? 'Registration closes' : 'Last date to apply';
  const startDateLabel = draft.category === 'Hackathon' ? 'Registration opens' : 'Applications open';
  const feeLabel = draft.category === 'Hackathon' ? 'Registration fee' : 'Application fee';
  const applyLabel = draft.category === 'Hackathon' ? 'Official registration link' : 'Official apply link';
  const documentLabel = draft.category === 'Hackathon' ? 'Rules / brochure PDF link' : draft.category === 'Scholarship' ? 'Guidelines PDF link' : 'Notification PDF link';

  function set<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function setDetail(key: DetailKey, value: string) {
    setDraft((current) => ({ ...current, details: { ...current.details, [key]: value } }));
  }

  function setCategory(category: Category) {
    setDraft((current) => ({ ...current, category, details: {}, ageLimit: category.includes('Job') ? current.ageLimit : '' }));
  }

  return <div className="admin-form-layout">
    <form className="post-form" onSubmit={onSave}>
      <SectionHeading number="01" title="Basic details" help={`Add the main information for this ${kind} listing.`} />
      <div className="form-grid">
        <label className="full">Post title <b>*</b><input value={draft.title} onChange={(event) => set('title', event.target.value)} required maxLength={180} placeholder={draft.category === 'Internship' ? 'e.g. Software Engineering Internship 2026' : draft.category === 'Hackathon' ? 'e.g. Smart India Hackathon 2026' : draft.category === 'Scholarship' ? 'e.g. AICTE Pragati Scholarship 2026' : 'e.g. RRB Station Master Recruitment 2026'} /></label>
        <label>Category <b>*</b><select value={draft.category} onChange={(event) => setCategory(event.target.value as Category)}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label>{organizationLabel} <b>*</b><input value={draft.organization} onChange={(event) => set('organization', event.target.value)} required placeholder={job ? 'e.g. APPSC, Amazon' : 'Enter the official organization name'} /></label>
        <label>{locationLabel} <b>*</b><input value={draft.location} onChange={(event) => set('location', event.target.value)} required placeholder={draft.category === 'Scholarship' ? 'e.g. Pan-India, Telangana' : 'e.g. Hyderabad, Pan-India, Remote'} /></label>
        <label>{eligibilityLabel} <b>*</b><input value={draft.eligibility} onChange={(event) => set('eligibility', event.target.value)} required placeholder={draft.category === 'Scholarship' ? 'e.g. Class 12 pass with 60% marks' : 'e.g. B.Tech 2024–2026'} /></label>
        <label className="full">Age limit {job ? <b>*</b> : <span>(optional)</span>}<input value={draft.ageLimit} onChange={(event) => set('ageLimit', event.target.value)} required={job} placeholder={job ? 'e.g. 18–30 years, relaxations as applicable' : 'e.g. No age limit or 18–25 years'} /></label>
      </div>

      {extra.length > 0 && <>
        <SectionHeading number="02" title={`${draft.category} details`} help="These fields help visitors compare this opportunity quickly." />
        <div className="form-grid">
          {extra.map((field) => <label className={field.full ? 'full' : undefined} key={field.key}>{field.label} <span>(optional)</span><input value={draft.details?.[field.key] || ''} onChange={(event) => setDetail(field.key, event.target.value)} maxLength={300} placeholder={field.placeholder} /></label>)}
        </div>
      </>}

      <SectionHeading number={extra.length ? '03' : '02'} title="Dates and fee" help="Listings leave the public site after the final date in IST." />
      <div className="form-grid">
        <label>{startDateLabel} <b>*</b><input type="date" value={draft.startDate} onChange={(event) => set('startDate', event.target.value)} required /></label>
        <label>{lastDateLabel} <b>*</b><input type="date" value={draft.lastDate} min={draft.startDate || undefined} onChange={(event) => set('lastDate', event.target.value)} required /></label>
        <label className="full">Other important dates <span>(optional)</span><textarea value={draft.importantDates} onChange={(event) => set('importantDates', event.target.value)} rows={3} placeholder={draft.category === 'Hackathon' ? 'e.g. Shortlist: 5 Dec · Finale: 12 Dec' : draft.category === 'Scholarship' ? 'e.g. Document verification: 20 Dec' : 'e.g. Exam, interview, result or joining dates'} /></label>
        <label className="full">{feeLabel} <b>*</b><input value={draft.applicationFee} onChange={(event) => set('applicationFee', event.target.value)} required placeholder="e.g. Free / ₹0 or category-wise fee" /></label>
      </div>

      <SectionHeading number={extra.length ? '04' : '03'} title="Official links" help="Only HTTPS links to official sources are accepted." />
      <div className="form-grid">
        <label className="full">{applyLabel} <b>*</b><input type="url" value={draft.applyLink} onChange={(event) => set('applyLink', event.target.value)} required placeholder="https://official-portal.example/apply" /></label>
        <label className="full">{documentLabel} <span>(optional)</span><input type="url" value={draft.notificationLink} onChange={(event) => set('notificationLink', event.target.value)} placeholder="https://official-portal.example/notification.pdf" /></label>
      </div>
      <div className="form-buttons"><button type="button" className="cancel-button" onClick={onCancel}>Cancel</button><button className="admin-primary" type="submit" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes →' : 'Publish opportunity →'}</button></div>
    </form>
    <aside className="form-aside"><div className="form-aside-icon">✦</div><h3>Before you publish</h3><p>Check the dates and make sure the link goes to the official {kind} page.</p><div className="form-aside-note">Expired listings are hidden at midnight IST after their last date and then removed from MongoDB.</div></aside>
  </div>;
}
