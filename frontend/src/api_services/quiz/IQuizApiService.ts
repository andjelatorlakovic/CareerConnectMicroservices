import type { JobListingQuestion } from '../../models/quiz/JobListingQuestion';
import type { QuizAnswer } from '../../models/quiz/QuizAnswer';
import type { AddQuestionRequest } from '../../types/quiz/AddQuestionRequest';

export interface IQuizApiService {
  getJobQuestions(
    jobId: string
  ): Promise<JobListingQuestion[]>;

  addQuestion(
    jobId: string,
    request: AddQuestionRequest
  ): Promise<JobListingQuestion>;

  deleteQuestion(
    jobId: string,
    questionId: string
  ): Promise<void>;

  getApplicationAnswers(
    applicationId: string
  ): Promise<QuizAnswer[]>;
}
