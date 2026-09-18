import type { ApplicationStatus } from './ApplicationStatus';

export interface JobApplication {
  id: string;
  candidateProfileId: string;
  jobListingId: string;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string;
}