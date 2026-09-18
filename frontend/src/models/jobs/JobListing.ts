import type { EmploymentType } from './EmploymentType';
import type { ExperienceLevel } from './ExperienceLevel';
import type { JobCategory } from './JobCategory';
import type { JobStatus } from './JobStatus';
import type { Skill } from './Skill';

export interface JobListing {
  id: string;
  companyProfileId: string;
  title: string;
  description: string;
  location: string;
  experienceLevel: ExperienceLevel;
  jobCategory: JobCategory;
  status: JobStatus;
  createdAt: string;
  expiresAt: string;
  skills: Skill[];
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
}