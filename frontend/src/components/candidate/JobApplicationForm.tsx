import { useState, type FormEvent } from 'react';

import type { JobListingQuestion } from '../../models/quiz/JobListingQuestion';
import type { CreateJobApplicationRequest } from '../../types/applications/CreateJobApplicationRequest';

interface JobApplicationFormProps {
  questions: JobListingQuestion[];
  loading: boolean;

  onSubmit: (
    request: CreateJobApplicationRequest
  ) => Promise<void>;
}

export default function JobApplicationForm({
  questions,
  loading,
  onSubmit,
}: JobApplicationFormProps) {
  const [coverLetter, setCoverLetter] = useState('');

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const sortedQuestions = [...questions].sort(
    (first, second) => first.orderIndex - second.orderIndex
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await onSubmit({
      coverLetter: coverLetter.trim(),
      answers: sortedQuestions
        .filter((question) => answers[question.id]?.trim())
        .map((question) => ({
          questionId: question.id,
          answer: answers[question.id].trim(),
        })),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset
        disabled={loading}
        className="m-0 grid min-w-0 gap-5 border-0 p-0"
      >
        <label className="grid gap-2 text-sm font-semibold">
          Cover Letter

          <textarea
            value={coverLetter}
            placeholder="Tell the company why you are interested in this position."
            onChange={(event) => {
              setCoverLetter(event.target.value);
            }}
            className="min-h-36 w-full resize-y rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm leading-relaxed outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
            maxLength={3000}
          />
        </label>

        {sortedQuestions.length > 0 && (
          <div className="grid gap-5 border-0 border-t border-solid border-[#e5e2ec] pt-5">
            <h3 className="m-0 text-base font-bold text-[#333344]">
              Company questions
            </h3>

            {sortedQuestions.map((question, index) => (
              <label
                key={question.id}
                className="grid gap-2 text-sm font-semibold"
              >
                {index + 1}. {question.questionText}

                <textarea
                  value={answers[question.id] ?? ''}
                  placeholder="Enter your answer"
                  onChange={(event) => {
                    setAnswers((previous) => ({
                      ...previous,
                      [question.id]: event.target.value,
                    }));
                  }}
                  className="min-h-28 w-full resize-y rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
                  maxLength={3000}
                />
              </label>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="w-fit cursor-pointer rounded-lg border-0 bg-[#ef476f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#df3d65] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Submitting application...' : 'Submit application'}
        </button>
      </fieldset>
    </form>
  );
}
