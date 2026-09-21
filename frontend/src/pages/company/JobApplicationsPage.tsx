import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { jobApplicationsApi } from '../../api_services/applications/JobApplicationsApiService';
import { quizApi } from '../../api_services/quiz/QuizApiService';

import CompanyLayout from '../../components/company/CompanyLayout';
import { useRealtimeEvent } from '../../hooks/realtime/useRealtimeEvent';

import {
  ApplicationStatus,
  type ApplicationStatus as ApplicationStatusValue,
} from '../../models/applications/ApplicationStatus';

import type { JobApplication } from '../../models/applications/JobApplication';
import type { QuizAnswer } from '../../models/quiz/QuizAnswer';

export default function JobApplicationsPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [applications, setApplications] =
    useState<JobApplication[]>([]);

  const [answers, setAnswers] =
    useState<Record<string, QuizAnswer[]>>({});

  const [openAnswersId, setOpenAnswersId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleApplicationsChanged = useCallback(
    (changedJobId: string) => {
      if (changedJobId === jobId) {
        setRefreshKey((previous) => previous + 1);
      }
    },
    [jobId]
  );

  useRealtimeEvent<string>(
    'JobApplicationsChanged',
    handleApplicationsChanged
  );

  // ========================================
  // LOAD APPLICATIONS
  // ========================================

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const loadApplications = async () => {
      try {
        setLoading(true);
        setError('');

        const data =
          await jobApplicationsApi.getApplicationsForJob(jobId);

        setApplications(data);
      } catch {
        setError('Applications could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    void loadApplications();
  }, [jobId, refreshKey]);

  // ========================================
  // CHANGE APPLICATION STATUS
  // ========================================

  const handleStatusChange = async (
    applicationId: string,
    status: ApplicationStatusValue
  ) => {
    try {
      setError('');

      const updated =
        await jobApplicationsApi.updateApplicationStatus(
          applicationId,
          { status }
        );

      setApplications((previous) =>
        previous.map((application) =>
          application.id === updated.id
            ? updated
            : application
        )
      );
    } catch {
      setError(
        'Application status could not be updated.'
      );
    }
  };

  // ========================================
  // SHOW / HIDE ANSWERS
  // ========================================

  const toggleAnswers = async (
    applicationId: string
  ) => {
    if (openAnswersId === applicationId) {
      setOpenAnswersId(null);
      return;
    }

    try {
      setError('');

      if (!answers[applicationId]) {
        const data =
          await quizApi.getApplicationAnswers(
            applicationId
          );

        setAnswers((previous) => ({
          ...previous,
          [applicationId]: data,
        }));
      }

      setOpenAnswersId(applicationId);
    } catch {
      setError(
        'Answers could not be loaded.'
      );
    }
  };

  return (
    <CompanyLayout>
      <div className="applications-page !min-h-0 !bg-transparent !p-0">

        <div className="applications-container !min-h-[86vh] !rounded-[28px] !border !border-solid !border-[#e3dfe8] !bg-[#f7f7fb] !p-4 !shadow-xl sm:!p-8">

          {/* ========================================
              BACK BUTTON
          ======================================== */}

          <button
            type="button"
            className="back-button !mb-7 !inline-flex !items-center !gap-3 !border-0 !bg-transparent !p-0 !text-base !font-bold !text-[#c8385c] hover:!underline"
            onClick={() =>
              navigate(`/my-jobs/${jobId}`)
            }
          >
            <span>←</span>
            Back
          </button>

          <header className="rounded-3xl bg-[#24233d] p-6 sm:p-8">
            <div>
              <h1 className="m-0 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Job Applications
              </h1>

              <p className="m-0 mt-2 text-sm leading-relaxed text-[#d3d1e0]">
                Review applications submitted for this job posting.
              </p>
            </div>
          </header>

          {/* ========================================
              LOADING
          ======================================== */}

          {loading && (
            <div className="state-container !grid !min-h-72 !place-items-center !gap-3 !text-[#666576]">

              <div className="spinner" />

              <p>
                Loading applications...
              </p>

            </div>
          )}

          {/* ========================================
              ERROR
          ======================================== */}

          {!loading && error && (
            <div className="error-container !mt-6 !flex !items-center !gap-4 !rounded-2xl !border !border-solid !border-[#f0c4d0] !bg-[#fff3f6] !p-5 !text-[#a43651]">

              <div className="error-icon">
                !
              </div>

              <div>

                <strong>
                  Something went wrong
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>
          )}

          {/* ========================================
              EMPTY
          ======================================== */}

          {!loading &&
            !error &&
            applications.length === 0 && (
              <div className="empty-container !mt-10 !grid !w-full !max-w-none !justify-items-center !gap-4 !rounded-2xl !border !border-dashed !border-[#d9d9e2] !bg-white !p-10 !text-center !shadow-sm">
                <h2 className="!m-0 !text-2xl !font-bold !text-[#333344]">
                  No applications yet
                </h2>

                <p className="!m-0 !text-base !leading-relaxed !text-[#666576]">
                  No applications have been received for this job yet.                  
                </p>

                <button
                  type="button"
                  className="empty-button !mt-2 !inline-flex !items-center !gap-2 !rounded-xl !border-0 !bg-[#ef476f] !px-5 !py-3 !font-bold !text-white hover:!bg-[#d9365f]"
                  onClick={() =>
                    navigate(`/my-jobs/${jobId}`)
                  }
                >
                  <span>←</span>
                  Back to job details
                </button>

              </div>
            )}

          {/* ========================================
              APPLICATIONS
          ======================================== */}

          {!loading &&
            !error &&
            applications.length > 0 && (

              <div className="applications-content">

                {/* ========================================
                    LIST HEADER
                ======================================== */}

                <div className="list-header !mt-6 !flex !flex-wrap !items-center !justify-between !gap-4 !rounded-2xl !border !border-solid !border-[#e6e2eb] !bg-white !p-5">

                  <div>

                    <h2 className="!m-0 !text-xl !font-bold !text-[#333344]">
                      Applications
                    </h2>

                    <span className="!mt-1 !block !text-sm !text-[#777686]">
                      Review candidate information and responses.
                    </span>

                  </div>

                  <span className="application-count !rounded-full !bg-[#fce8ee] !px-3 !py-1 !text-sm !font-bold !text-[#c8385c]">
                    {applications.length} applications
                  </span>

                </div>

                {/* ========================================
                    APPLICATION LIST
                ======================================== */}

                <div className="applications-list !mt-4 !grid !gap-4">

                  {applications.map((application) => {

                    const isAccepted =
                      application.status ===
                      ApplicationStatus.Accepted;

                    const isRejected =
                      application.status ===
                      ApplicationStatus.Rejected;

                    return (
                      <article
                        key={application.id}
                        className="application-item !flex !overflow-hidden !rounded-2xl !border !border-solid !border-[#e6e2eb] !bg-white !shadow-sm"
                      >

                        {/* ========================================
                            SIDE
                        ======================================== */}

                        <div
                          className={
                            isAccepted
                              ? 'application-side accepted-side'
                              : isRejected
                              ? 'application-side rejected-side'
                              : 'application-side pending-side'
                          }
                        >

                          <span className="application-symbol">

                            {isAccepted
                              ? '✓'
                              : isRejected
                              ? '×'
                              : '◷'}

                          </span>

                        </div>

                        {/* ========================================
                            MAIN INFO
                        ======================================== */}

                        <div className="application-main !min-w-0 !flex-1 !p-5">

                          <div className="application-top !flex !flex-wrap !items-start !justify-between !gap-4">

                            <div className="candidate-info">

                              <div className="candidate-avatar">
                                <span>
                                  ♙
                                </span>
                              </div>

                              <div>

                                <div className="candidate-title-row">

                                  <h3>
                                    Candidate
                                  </h3>

                                  <span
                                    className={
                                      isAccepted
                                        ? 'status-sticker accepted-sticker'
                                        : isRejected
                                        ? 'status-sticker rejected-sticker'
                                        : 'status-sticker pending-sticker'
                                    }
                                  >

                                    <span className="sticker-dot" />

                                    {isAccepted
                                      ? 'ACCEPTED'
                                      : isRejected
                                      ? 'REJECTED'
                                      : 'PENDING'}

                                  </span>

                                </div>

                                <span className="candidate-id">
                                  ID: {application.candidateProfileId}
                                </span>

                              </div>

                            </div>

                            <div className="application-date">

                              <span>
                                Applied on
                              </span>

                              <strong>
                                {new Date(
                                  application.appliedAt
                                ).toLocaleString('sr-RS')}
                              </strong>

                            </div>

                          </div>

                          {/* ========================================
                              COVER LETTER
                          ======================================== */}

                          <div className="cover-letter !mt-5 !rounded-xl !bg-[#f8f8fc] !p-4">

                            <div className="section-label">

                              <span className="label-icon">
                                ✎
                              </span>
                              Cover Letter
                            </div>

                            <p>
                              {application.coverLetter ||
                                'Candidate has not submitted a cover letter.'}
                            </p>

                          </div>

                          {/* ========================================
                              ACTIONS
                          ======================================== */}

                          <div className="application-actions !mt-5 !flex !flex-wrap !items-end !justify-between !gap-4">

                            <div className="status-control !grid !gap-2 !rounded-xl !border !border-solid !border-[#e6e2eb] !bg-[#f8f8fc] !px-4 !py-3">

                              <label
                                htmlFor={`status-${application.id}`}
                                className="!text-xs !font-bold !uppercase !tracking-wide !text-[#777686]"
                              >
                                Application Status
                              </label>

                              <select
                                id={`status-${application.id}`}
                                value={application.status}
                                onChange={(event) =>
                                  void handleStatusChange(
                                    application.id,
                                    event.target
                                      .value as ApplicationStatusValue
                                  )
                                }
                                className="!h-10 !min-w-40 !rounded-lg !border !border-solid !border-[#d9d5e2] !bg-white !px-3 !text-sm !font-semibold !text-[#333344] !outline-none hover:!border-[#ef476f] focus:!border-[#ef476f] focus:!ring-4 focus:!ring-[#ef476f]/10"
                              >

                                {Object.values(
                                  ApplicationStatus
                                ).map((status) => (
                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {status}
                                  </option>
                                ))}

                              </select>

                            </div>

                            <button
                              type="button"
                              className="answers-button !inline-flex !items-center !gap-2 !rounded-xl !border !border-solid !border-[#ef476f] !bg-white !px-4 !py-3 !font-semibold !text-[#c8385c] hover:!bg-[#fff1f4]"
                              onClick={() =>
                                void toggleAnswers(
                                  application.id
                                )
                              }
                            >

                              <span>
                                {openAnswersId ===
                                application.id
                                  ? '−'
                                  : '＋'}
                              </span>

                              {openAnswersId ===
                              application.id
                                ? 'Sakrij odgovore'
                                : 'Show answers'}

                            </button>

                          </div>

                          {/* ========================================
                              ANSWERS
                          ======================================== */}

                          {openAnswersId ===
                            application.id && (
                            <div className="answers-container !mt-5 !rounded-2xl !border !border-solid !border-[#f1c8d3] !bg-[#fff7f9] !p-5">

                              <div className="answers-header">

                                <div>

                                  <h4>
                                    Candidate Answers
                                  </h4>

                                  <span>
                                    Candidate answers to job questions.
                                  </span>

                                </div>

                                <span className="answers-count">
                                  {answers[
                                    application.id
                                  ]?.length ?? 0}
                                </span>

                              </div>

                              {answers[
                                application.id
                              ]?.length ? (
                                <div className="answers-list">

                                  {answers[
                                    application.id
                                  ].map(
                                    (
                                      answer,
                                      index
                                    ) => (
                                      <div
                                        key={
                                          answer.id ??
                                          `${answer.jobListingQuestionId}-${index}`
                                        }
                                        className="answer-item !flex !gap-3 !rounded-xl !bg-white !p-4"
                                      >

                                        <div className="answer-number">
                                          {index + 1}
                                        </div>

                                        <div className="answer-content">

                                          <span>
                                            Question {index + 1}
                                          </span>

                                          <small>
                                            Question ID: {answer.jobListingQuestionId}
                                          </small>

                                          <p>
                                            {answer.answer}
                                          </p>

                                        </div>

                                      </div>
                                    )
                                  )}

                                </div>
                              ) : (
                                <div className="no-answers">
                                  Candidate has not answered
                                  the questions.
                                </div>
                              )}

                            </div>
                          )}

                        </div>

                      </article>
                    );
                  })}

                </div>

              </div>
            )}

        </div>

      </div>
    </CompanyLayout>
  );
}
