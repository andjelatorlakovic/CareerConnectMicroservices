import api from '../axios/AxiosInstance';

import type { JobListingQuestion } from '../../models/quiz/JobListingQuestion';
import type { QuizAnswer } from '../../models/quiz/QuizAnswer';
import type { AddQuestionRequest } from '../../types/quiz/AddQuestionRequest';
import type { SubmitAnswerRequest } from '../../types/quiz/SubmitAnswerRequest';
import type { IQuizApiService } from './IQuizApiService';

export const quizApi: IQuizApiService = {
  async getJobQuestions(jobId: string) {
    return (
      await api.get<JobListingQuestion[]>(
        `/quiz/jobs/${jobId}/questions`
      )
    ).data;
  },

  async addQuestion(
    jobId: string,
    request: AddQuestionRequest
  ) {
    return (
      await api.post<JobListingQuestion>(
        `/quiz/jobs/${jobId}/questions`,
        request
      )
    ).data;
  },

  async deleteQuestion(jobId: string, questionId: string) {
    await api.delete(
      `/quiz/jobs/${jobId}/questions/${questionId}`
    );
  },

  async getApplicationAnswers(applicationId: string) {
    return (
      await api.get<QuizAnswer[]>(
        `/quiz/applications/${applicationId}/answers`
      )
    ).data;
  },

  async submitAnswers(
    applicationId: string,
    answers: SubmitAnswerRequest[]
  ) {
    await api.post(`/quiz/applications/${applicationId}/answers`, answers);
  },
};
