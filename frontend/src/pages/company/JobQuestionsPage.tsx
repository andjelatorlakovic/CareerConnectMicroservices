import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { quizApi } from '../../api_services/quiz/QuizApiService';
import CompanyLayout from '../../components/company/CompanyLayout';
import QuestionForm from '../../components/company/QuestionForm';

import type { JobListingQuestion } from '../../models/quiz/JobListingQuestion';

export default function JobQuestionsPage() {
  const { id: jobId } = useParams<{ id: string }>();

  const [questions, setQuestions] =
    useState<JobListingQuestion[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadQuestions = async () => {
    if (!jobId) {
      return;
    }

    try {
      setError('');

      const result =
        await quizApi.getJobQuestions(jobId);

      setQuestions(result);
    } catch (error) {
      console.error(
        'GET QUESTIONS ERROR:',
        error
      );

      setError('Questions are unavailable.');
    }
  };

  useEffect(() => {
    void loadQuestions();
  }, [jobId]);

  const handleAdd = async (
    questionText: string
  ) => {
    if (!jobId) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await quizApi.addQuestion(jobId, {
        questionText,
        orderIndex: questions.length + 1,
      });

      await loadQuestions();
    } catch (error) {
      console.error(
        'ADD QUESTION ERROR:',
        error
      );

      setError(
        'Question could not be added.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    questionId: string
  ) => {
    if (
      !jobId ||
      !window.confirm('Obrisati pitanje?')
    ) {
      return;
    }

    try {
      setError('');

      await quizApi.deleteQuestion(
        jobId,
        questionId
      );

      await loadQuestions();
    } catch (error) {
      console.error(
        'DELETE QUESTION ERROR:',
        error
      );

      setError(
        'Question could not be deleted.'
      );
    }
  };

  return (
    <CompanyLayout>
      <div className="questions-page !min-h-0 !bg-transparent !p-0">
        <div className="questions-content !min-h-[86vh] !rounded-[28px] !border !border-solid !border-[#e3dfe8] !bg-[#f7f7fb] !p-4 !shadow-xl sm:!p-8">

          <QuestionForm
            loading={loading}
            onSubmit={(text) =>
              void handleAdd(text)
            }
          />

          {error && (
            <div className="error-message !mx-auto !mt-4 !max-w-3xl !rounded-xl !border !border-solid !border-[#f2ccd8] !bg-[#fff3f6] !p-4 !font-semibold !text-[#c8385c]">
              {error}
            </div>
          )}

          {questions.length > 0 && (
            <div className="questions-list !mx-auto !mt-6 !grid !max-w-3xl !gap-3">

              <div className="questions-list-header !flex !items-center !gap-3">
                <h2 className="!m-0 !text-2xl !font-bold !text-[#333344]">Questions</h2>

                <span className="!grid !size-8 !place-items-center !rounded-full !bg-[#fce8ee] !text-sm !font-bold !text-[#c8385c]">
                  {questions.length}
                </span>
              </div>

              {questions.map((question) => (
                <article
                  key={question.id}
                  className="question-item !flex !items-center !gap-4 !rounded-2xl !border !border-solid !border-[#e6e2eb] !bg-white !p-4 !shadow-sm"
                >
                  <div className="question-number !grid !size-9 !shrink-0 !place-items-center !rounded-full !bg-[#24233d] !font-bold !text-white">
                    {question.orderIndex}
                  </div>

                  <div className="question-content !min-w-0 !flex-1">
                    <span className="!text-sm !font-semibold !text-[#45445a]">
                      Question {question.orderIndex}
                    </span>

                    <p className="!mb-0 !mt-1 !text-[#555466]">
                      {question.questionText}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="delete-button !rounded-lg !border !border-solid !border-[#f0c4d0] !bg-[#fff3f6] !px-3 !py-2 !text-sm !font-semibold !text-[#c8385c] hover:!bg-[#fce5ec]"
                    onClick={() =>
                      void handleDelete(
                        question.id
                      )
                    }
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>    </CompanyLayout>
  );
}
