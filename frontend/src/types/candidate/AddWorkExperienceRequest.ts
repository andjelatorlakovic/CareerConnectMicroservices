export interface AddWorkExperienceRequest {
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string | null;
}