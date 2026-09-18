import type { CandidateProfile } from '../../models/candidate/CandidateProfile';
import type { Education } from '../../models/candidate/Education';
import type { WorkExperience } from '../../models/candidate/WorkExperience';

import type { UpdateCandidateProfileRequest } from '../../types/candidate/UpdateCandidateProfileRequest';
import type { AddEducationRequest } from '../../types/candidate/AddEducationRequest';
import type { AddWorkExperienceRequest } from '../../types/candidate/AddWorkExperienceRequest';

export interface ICandidateApiService {
  getCandidateProfile(): Promise<CandidateProfile>;

  updateCandidateProfile(
    request: UpdateCandidateProfileRequest
  ): Promise<CandidateProfile>;

  addEducation(
    request: AddEducationRequest
  ): Promise<Education>;

  deleteEducation(
    educationId: string
  ): Promise<boolean>;

  addWorkExperience(
    request: AddWorkExperienceRequest
  ): Promise<WorkExperience>;

  deleteWorkExperience(
    workExperienceId: string
  ): Promise<boolean>;
}