import type { ExperienceLevel } from '../jobs/ExperienceLevel';
import type { JobCategory } from '../jobs/JobCategory';
import type { Skill } from '../jobs/Skill';

import type { Education } from './Education';
import type { WorkExperience } from './WorkExperience';

export interface CandidateProfile {
  id: string;
  userId: string;
  bio: string;
  location: string;
  experienceLevel: ExperienceLevel;
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
  desiredJobCategories: JobCategory[];
}