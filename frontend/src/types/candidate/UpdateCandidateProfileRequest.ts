import type { ExperienceLevel } from '../../models/jobs/ExperienceLevel';
import type { JobCategory } from '../../models/jobs/JobCategory';
import type { Skill } from '../../models/jobs/Skill';

export interface UpdateCandidateProfileRequest {
  bio: string;
  location: string;
  experienceLevel: ExperienceLevel;
  skills: Skill[];
  desiredJobCategories: JobCategory[];
}