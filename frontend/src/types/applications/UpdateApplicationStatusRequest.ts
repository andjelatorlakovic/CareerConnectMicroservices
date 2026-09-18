import type { ApplicationStatus } from '../../models/applications/ApplicationStatus';

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
}