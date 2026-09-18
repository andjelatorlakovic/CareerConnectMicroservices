import type { EmploymentType } from '../../models/jobs/EmploymentType';
import type { ExperienceLevel } from '../../models/jobs/ExperienceLevel';
import type { JobCategory } from '../../models/jobs/JobCategory';
import type { Skill } from '../../models/jobs/Skill';

export interface JobFormData {
  title: string;
  description: string;
  location: string;
  experienceLevel: ExperienceLevel;
  jobCategory: JobCategory;
  expiresAt: string;
  skills: Skill[];
  employmentType: EmploymentType;
  salaryMin: string;
  salaryMax: string;
}