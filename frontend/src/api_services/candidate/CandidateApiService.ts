import api from '../axios/AxiosInstance';

import type { CandidateProfile } from '../../models/candidate/CandidateProfile';
import type { Education } from '../../models/candidate/Education';
import type { WorkExperience } from '../../models/candidate/WorkExperience';

import type { ICandidateApiService } from './ICandidateApiService';

export const candidateApi: ICandidateApiService = {
  async getCandidateProfile() {
    return (
      await api.get<CandidateProfile>(
        '/candidate-profile'
      )
    ).data;
  },

  async updateCandidateProfile(request) {
    return (
      await api.put<CandidateProfile>(
        '/candidate-profile',
        request
      )
    ).data;
  },

  async addEducation(request) {
    return (
      await api.post<Education>(
        '/candidate-profile/education',
        request
      )
    ).data;
  },

  async deleteEducation(educationId) {
    return (
      await api.delete<boolean>(
        `/candidate-profile/education/${educationId}`
      )
    ).data;
  },

  async addWorkExperience(request) {
    return (
      await api.post<WorkExperience>(
        '/candidate-profile/work-experience',
        request
      )
    ).data;
  },

  async deleteWorkExperience(workExperienceId) {
    return (
      await api.delete<boolean>(
        `/candidate-profile/work-experience/${workExperienceId}`
      )
    ).data;
  },
};