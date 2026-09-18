export const ApplicationStatus = {
  Pending: 'Pending',
  Reviewed: 'Reviewed',
  Accepted: 'Accepted',
  Rejected: 'Rejected',
} as const;

export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];