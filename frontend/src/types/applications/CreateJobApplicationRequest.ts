import type { SubmitAnswerRequest } from '../quiz/SubmitAnswerRequest';

export interface CreateJobApplicationRequest {
  coverLetter: string;
  answers: SubmitAnswerRequest[];
}