import api from '../axios/AxiosInstance';

import type { CompanyProfile } from '../../models/company/CompanyProfile';
import type { UpdateCompanyProfileRequest } from '../../types/company/UpdateCompanyProfileRequest';
import type { ICompanyApiService } from './ICompanyApiService';

export const companyApi: ICompanyApiService = {
  async getCompanyProfile() {
    return (
      await api.get<CompanyProfile>('/company-profile/profile')
    ).data;
  },

  async updateCompanyProfile(
    request: UpdateCompanyProfileRequest
  ) {
    return (
      await api.put<CompanyProfile>(
        '/company-profile/profile',
        request
      )
    ).data;
  },
};