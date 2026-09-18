import type { CompanyProfile } from '../../models/company/CompanyProfile';
import type { UpdateCompanyProfileRequest } from '../../types/company/UpdateCompanyProfileRequest';

export interface ICompanyApiService {
  getCompanyProfile(): Promise<CompanyProfile>;
  updateCompanyProfile(
    request: UpdateCompanyProfileRequest
  ): Promise<CompanyProfile>;
}