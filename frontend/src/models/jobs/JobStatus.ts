export const JobStatus = {
  Active: 'Active',
  Closed: 'Closed',
} as const;

export type JobStatus =
  (typeof JobStatus)[keyof typeof JobStatus];