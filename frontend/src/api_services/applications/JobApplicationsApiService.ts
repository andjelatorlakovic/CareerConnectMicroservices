import api from '../axios/AxiosInstance';

import type { JobApplication } from '../../models/applications/JobApplication';
import type { UpdateApplicationStatusRequest } from '../../types/applications/UpdateApplicationStatusRequest';
import type { IJobApplicationsApiService } from './IJobApplicationsApiService';

export const jobApplicationsApi: IJobApplicationsApiService = {
  async applyForJob(jobId, request) {
      return (
        await api.post<JobApplication>(
          `/job-applications/jobs/${jobId}`,
          request
        )
      ).data;
    },

    async getMyApplications() {
      return (
        await api.get<JobApplication[]>(
          '/job-applications/my'
        )
      ).data;
    },
  async getApplicationsForJob(jobId: string) {
    return (
      await api.get<JobApplication[]>(
        `/job-applications/jobs/${jobId}`
      )
    ).data;
  },

  async updateApplicationStatus(
    applicationId: string,
    request: UpdateApplicationStatusRequest
  ) {
    return (
      await api.patch<JobApplication>(
        `/job-applications/${applicationId}/status`,
        request
      )
    ).data;
  },
};