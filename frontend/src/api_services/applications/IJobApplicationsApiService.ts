import type { JobApplication } from '../../models/applications/JobApplication';
import type { UpdateApplicationStatusRequest } from '../../types/applications/UpdateApplicationStatusRequest';
import type { CreateJobApplicationRequest } from '../../types/applications/CreateJobApplicationRequest';

export interface IJobApplicationsApiService {
  getApplicationsForJob(
    jobId: string
  ): Promise<JobApplication[]>;

  updateApplicationStatus(
    applicationId: string,
    request: UpdateApplicationStatusRequest
  ): Promise<JobApplication>;
  applyForJob(
    jobId: string,
    request: CreateJobApplicationRequest
  ): Promise<JobApplication>;

  getMyApplications(): Promise<JobApplication[]>;
}