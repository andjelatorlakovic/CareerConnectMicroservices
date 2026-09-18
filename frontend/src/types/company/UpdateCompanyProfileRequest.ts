export interface UpdateCompanyProfileRequest {
  name: string;
  description: string;
  location: string;
  website: string | null;
  industry: string;
  contactEmail: string;
  contactPhone: string;
}
