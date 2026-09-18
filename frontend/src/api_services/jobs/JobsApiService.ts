import api from '../axios/AxiosInstance';

import type { JobListing } from '../../models/jobs/JobListing';
import type { CreateJobRequest } from '../../types/jobs/CreateJobRequest';
import type { UpdateJobRequest } from '../../types/jobs/UpdateJobRequest';
import type { IJobsApiService } from './IJobsApiService';

export const jobsApi: IJobsApiService = {
  async getJobs(filters = {}) {
    const params = new URLSearchParams();

    if (filters.location?.trim()) {
      params.set('location', filters.location.trim());
    }

    if (filters.experienceLevel) {
      params.set(
        'experienceLevel',
        filters.experienceLevel
      );
    }

    filters.skills?.forEach((skill) => {
      params.append('skills', skill);
    });

    return (
      await api.get<JobListing[]>('/jobs', {
        params,
      })
    ).data;
  },
  async getMyJobs() {
    return (await api.get<JobListing[]>('/jobs/my')).data;
  },

  async getJobById(jobId) {
    return (await api.get<JobListing>(`/jobs/${jobId}`)).data;
  },

  async createJob(request: CreateJobRequest) {
    return (await api.post<JobListing>('/jobs', request)).data;
  },

  async updateJob(
    jobId: string,
    request: UpdateJobRequest
  ) {
    return (
      await api.put<JobListing>(`/jobs/${jobId}`, request)
    ).data;
  },

  async closeJob(jobId: string) {
    await api.patch(`/jobs/${jobId}/close`);
  },
  async getJobsByUser(userId) {
    return (
      await api.get<JobListing[]>(
        `/jobs/by-user/${userId}`
      )
    ).data;
  }
};