import api from '../axios/AxiosInstance';

import type { MatchResult } from '../../models/matching/MatchResult';
import type { IMatchingApiService } from './IMatchingApiService';

export const matchingApi: IMatchingApiService = {
  async getMatchingJobs() {
    return (
      await api.get<MatchResult[]>(
        '/matching/jobs'
      )
    ).data;
  },
};