import type { JobCategory } from '../jobs/JobCategory';
import type { Skill } from '../jobs/Skill';

export interface MatchResult {
  jobId: string;
  tittle: string;
  location: string;
  jobCategory: JobCategory;
  requiredSkills: Skill[];
  matchedSkills: Skill[];
  missingSkills: Skill[];
  matchPercentage: number;
}