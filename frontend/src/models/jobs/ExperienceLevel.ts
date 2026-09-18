export const ExperienceLevel = {
  Student: 'Student',
  Junior: 'Junior',
  MidLevel: 'MidLevel',
  Senior: 'Senior',
  Lead: 'Lead',
  Internship: 'Internship',
} as const;

export type ExperienceLevel =
  (typeof ExperienceLevel)[keyof typeof ExperienceLevel];