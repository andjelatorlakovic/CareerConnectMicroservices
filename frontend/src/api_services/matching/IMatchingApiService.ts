import type { MatchResult } from '../../models/matching/MatchResult';

export interface IMatchingApiService {
  getMatchingJobs(): Promise<MatchResult[]>;
}