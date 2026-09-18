export const Role = {
  Candidate: 'Candidate',
  Company: 'Company',
  Admin: 'Admin',
} as const;

export type Role =
  (typeof Role)[keyof typeof Role];