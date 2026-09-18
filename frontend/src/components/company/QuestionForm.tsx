import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface QuestionFormProps {
  loading: boolean;
  onSubmit: (questionText: string) => void;
}

export default function QuestionForm({
  loading,
  onSubmit,
}: QuestionFormProps) {
  const navigate = useNavigate();
  const { id: jobId } = useParams<{ id: string }>();

  const [questionText, setQuestionText] = useState('');

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!questionText.trim()) {
      return;
    }

    onSubmit(questionText.trim());
    setQuestionText('');
  };

  return (
    <div className="question-page !min-h-0 !bg-transparent !p-0">
      <div className="question-card !mx-auto !w-full !max-w-3xl !rounded-[28px] !border !border-solid !border-[#e3dfe8] !bg-[#f7f7fb] !p-4 !shadow-xl sm:!p-8">

        <button
          type="button"
          className="back-button !mb-7 !inline-flex !items-center !gap-3 !border-0 !bg-transparent !p-0 !text-base !font-bold !text-[#c8385c] hover:!underline"
          onClick={() => {
            if (jobId) {
              navigate(`/my-jobs/${jobId}`);
            }
          }}
        >
          <span>←</span>
          Back
        </button>

        <div className="question-header !rounded-3xl !border-0 !bg-[#24233d] !p-6 sm:!p-8">
          <h1 className="!m-0 !text-3xl !font-bold !text-white">Add question</h1>

          <p className="!mb-0 !mt-2 !text-sm !leading-relaxed !text-[#d3d1e0]">
            Add a question that will help candidates
            demonstrate their skills and knowledge for this job.
          
          </p>
        </div>

        <form
          className="question-form !mt-6 !grid !gap-4"
          onSubmit={handleSubmit}
        >
          <div className="form-field">
            <label htmlFor="question" className="text-sm font-semibold text-[#45445a]">
              Question
            </label>

            <textarea
              id="question"
              value={questionText}
              onChange={(event) =>
                setQuestionText(event.target.value)
              }
              placeholder="Enter a question..."
              rows={4}
              className="min-h-28 w-full rounded-xl border border-solid border-[#e2dfe9] bg-white px-4 py-3 text-sm text-[#333344] outline-none placeholder:text-[#aaa8b4] focus:border-[#ef476f] focus:ring-4 focus:ring-[#ef476f]/10"
              required
              minLength={5}
              maxLength={1000}
            />
          </div>

          <button
            type="submit"
            className="question-submit-button !justify-self-start !rounded-xl !border-0 !bg-[#ef476f] !px-5 !py-3 !font-bold !text-white hover:!bg-[#d9365f] disabled:!opacity-60"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner" />
                Adding...
              </>
            ) : (
              <>
                <span className="plus-icon">+</span>
                Add question
              </>
            )}
          </button>
        </form>
      </div>    </div>
  );
}
