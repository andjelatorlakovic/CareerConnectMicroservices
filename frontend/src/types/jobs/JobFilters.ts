import type { ExperienceLevel } from '../../models/jobs/ExperienceLevel';
import type { Skill } from '../../models/jobs/Skill';

export interface JobFilters {
  location?: string;
  experienceLevel?: ExperienceLevel;
  skills?: Skill[];
}