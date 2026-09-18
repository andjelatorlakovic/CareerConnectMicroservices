export const EmploymentType = {
  FullTime: 'FullTime',
  PartTime: 'PartTime',
  Internship: 'Internship',
  Contract: 'Contract',
  Remote: 'Remote',
  Hybrid: 'Hybrid',
} as const;

export type EmploymentType =
  (typeof EmploymentType)[keyof typeof EmploymentType];