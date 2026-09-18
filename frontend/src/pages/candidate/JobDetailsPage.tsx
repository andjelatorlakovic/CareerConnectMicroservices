import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { jobsApi } from '../../api_services/jobs/JobsApiService';
import { quizApi } from '../../api_services/quiz/QuizApiService';
import { jobApplicationsApi } from '../../api_services/applications/JobApplicationsApiService';

import type { JobListing } from '../../models/jobs/JobListing';
import type { JobListingQuestion } from '../../models/quiz/JobListingQuestion';
import type { CreateJobApplicationRequest } from '../../types/applications/CreateJobApplicationRequest';

import { JobStatus } from '../../models/jobs/JobStatus';

import CandidateLayout from '../../components/candidate/CandidateLayout';
import JobApplicationForm from '../../components/candidate/JobApplicationForm';
import { useRealtimeEvent } from '../../hooks/realtime/useRealtimeEvent';

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<JobListing | null>(null);
  const [questions, setQuestions] =
    useState<JobListingQuestion[]>([]);

  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loadedId, setLoadedId] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');

  const loading = loadedId !== id || loadedId === undefined;

  const handleQuestionsChanged = useCallback(
    async (changedJobId: string) => {
      if (!id || changedJobId !== id) {
        return;
      }

      try {
        setQuestions(await quizApi.getJobQuestions(id));
      } catch {
        // The existing questions remain visible if a background refresh fails.
      }
    },
    [id]
  );

  useRealtimeEvent<string>(
    'JobQuestionsChanged',
    handleQuestionsChanged
  );

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      try {
        if (!id) {
          throw new Error('Missing job ID.');
        }

        const [jobData, questionData, applications] =
          await Promise.all([
            jobsApi.getJobById(id),
            quizApi.getJobQuestions(id),
            jobApplicationsApi.getMyApplications(),
          ]);

        if (active) {
          setJob(jobData);
          setQuestions(questionData);
          setError('');
          setSubmitError('');
          setSuccess('');

          setAlreadyApplied(
            applications.some(
              (application) => application.jobListingId === id
            )
          );
        }
      } catch {
        if (active) {
          setError('Job details could not be loaded.');
        }
      } finally {
        if (active) {
          setLoadedId(id ?? '');
        }
      }
    }

    void loadDetails();

    return () => {
      active = false;
    };
  }, [id]);

  const canApply = Boolean(
    job &&
    job.status === JobStatus.Active &&
    new Date(job.expiresAt).getTime() > Date.now()
  );

  const handleApply = async (
    request: CreateJobApplicationRequest
  ) => {
    if (
      !job ||
      !id ||
      job.id !== id ||
      submitting ||
      alreadyApplied ||
      job.status !== JobStatus.Active ||
      !(new Date(job.expiresAt).getTime() > Date.now())
    ) {
      setSubmitError('Prijava trenutno nije dostupna.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      setSuccess('');

      const application = await jobApplicationsApi.applyForJob(id, request);

      if (request.answers.length > 0) {
        await quizApi.submitAnswers(application.id, request.answers);
      }

      setAlreadyApplied(true);
      setSuccess('Your application was submitted successfully.');
    } catch {
      setSubmitError(
        'Your application could not be submitted. Check whether you have already applied or the job has expired.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CandidateLayout>
      <div className="grid min-h-[86vh] content-start gap-7 rounded-[28px] border border-solid border-[#e3dfe8] bg-[#f7f7fb] p-4 shadow-xl sm:p-8">
        <Link
          to="/jobs"
          className="mb-0 inline-flex w-fit items-center gap-3 text-base font-bold text-[#c8385c] no-underline hover:underline"
        >
          ← All jobs
        </Link>

        {loading && id && (
          <p className="m-0 py-10 text-center text-[#858592]">
            Loading job...
          </p>
        )}

        {(!id || (!loading && error)) && (
          <div
            role="alert"
            className="rounded-lg border border-solid border-[#f2c5ce] bg-[#fff2f4] p-4 text-[#a43651]"
          >
            {!id ? 'Job not found.' : error}
          </div>
        )}

        {!loading && !error && job && (
          <>
            <header className="rounded-3xl bg-[#24233d] p-6 sm:p-8">
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#ef476f] text-xl">
                  💼
                </div>

                <div className="min-w-0">
                  <h1 className="m-0 break-words text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {job.title}
                  </h1>

                  <p className="m-0 mt-2 text-sm leading-relaxed text-[#d3d1e0]">
                    {job.location} · {job.jobCategory}
                  </p>
                </div>
              </div>
            </header>

            <section className="rounded-2xl border border-solid border-[#e6e2eb] bg-white p-5">
              <div className="mb-5 flex items-start gap-3">
                <div className="mt-1 h-9 w-1 rounded-full bg-[#ef476f]" />
                <div>
                  <h2 className="m-0 text-xl font-bold text-[#333344]">
                    Basic Information
                  </h2>
                  <p className="m-0 mt-1 text-sm text-[#777686]">
                    Information about the position and working conditions
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl border border-solid border-[#e6e2eb] bg-[#f8f8fc] p-4">
                  <span>📍</span><div className="grid gap-1"><span className="text-xs font-semibold text-[#858592]">Location</span><strong className="text-base text-[#333344]">{job.location}</strong></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-solid border-[#e6e2eb] bg-[#f8f8fc] p-4">
                  <span>💼</span><div className="grid gap-1"><span className="text-xs font-semibold text-[#858592]">Employment Type</span><strong className="text-base text-[#333344]">{job.employmentType}</strong></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-solid border-[#e6e2eb] bg-[#f8f8fc] p-4">
                  <span>🎓</span><div className="grid gap-1"><span className="text-xs font-semibold text-[#858592]">Experience Level</span><strong className="text-base text-[#333344]">{job.experienceLevel}</strong></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-solid border-[#e6e2eb] bg-[#f8f8fc] p-4">
                  <span>🏷</span><div className="grid gap-1"><span className="text-xs font-semibold text-[#858592]">Category</span><strong className="text-base text-[#333344]">{job.jobCategory}</strong></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-solid border-[#e6e2eb] bg-[#f8f8fc] p-4">
                  <span>💰</span><div className="grid gap-1"><span className="text-xs font-semibold text-[#858592]">Salary</span><strong className="text-base text-[#333344]">{job.salaryMin !== null && job.salaryMax !== null ? `${job.salaryMin.toLocaleString('sr-Latn-RS')} – ${job.salaryMax.toLocaleString('sr-Latn-RS')}` : job.salaryMin !== null ? `From ${job.salaryMin.toLocaleString('sr-Latn-RS')}` : job.salaryMax !== null ? `Up to ${job.salaryMax.toLocaleString('sr-Latn-RS')}` : 'Not specified'}</strong></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-solid border-[#e6e2eb] bg-[#f8f8fc] p-4">
                  <span>📅</span><div className="grid gap-1"><span className="text-xs font-semibold text-[#858592]">Application Deadline</span><strong className="text-base text-[#333344]">{new Date(job.expiresAt).toLocaleDateString('sr-Latn-RS')}</strong></div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-solid border-[#e6e2eb] bg-white p-5">
              <div className="mb-5 flex items-start gap-3">
                <div className="mt-1 h-9 w-1 rounded-full bg-[#ef476f]" />
                <div>
                  <h2 className="m-0 text-xl font-bold text-[#333344]">
                    Job Description
                  </h2>
                  <p className="m-0 mt-1 text-sm text-[#777686]">
                    Detailed description of the job position
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#f8f8fc] p-5 text-[#4d4c5e]">
                <p className="m-0 whitespace-pre-wrap break-words leading-relaxed">
                  {job.description}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-solid border-[#e6e2eb] bg-white p-5">
              <div className="mb-5 flex items-start gap-3">
                <div className="mt-1 h-9 w-1 rounded-full bg-[#ef476f]" />
                <div>
                  <h2 className="m-0 text-xl font-bold text-[#333344]">
                    Required skills
                  </h2>
                  <p className="m-0 mt-1 text-sm text-[#777686]">
                    Skills and technologies the candidate should have
                  </p>
                </div>
              </div>

              {job.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-solid border-[#f3ccd7] bg-[#fcebf0] px-3 py-2 text-sm font-semibold text-[#c8385c]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-[#f8f8fc] p-4 text-sm text-[#777686]">
                  No specific skills listed.
                </div>
              )}
            </section>

            {submitError && (
              <div
                role="alert"
                className="rounded-lg border border-solid border-[#f2c5ce] bg-[#fff2f4] p-4 text-[#a43651]"
              >
                {submitError}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-lg border border-solid border-[#d5ebdd] bg-[#edf8f1] p-4 text-[#287648]"
              >
                {success}
              </div>
            )}

            {alreadyApplied ? (
              <section className="grid gap-4 rounded-xl border border-solid border-[#d9d9e2] bg-[#fafafd] p-5">
                <h2 className="m-0 text-lg font-bold text-[#333344]">
                  You have already applied
                </h2>

                <Link
                  to="/my-applications"
                  className="w-fit rounded-lg bg-[#ef476f] px-5 py-3 text-sm font-semibold text-white no-underline hover:bg-[#df3d65]"
                >
                  My Applications
                </Link>
              </section>
            ) : canApply ? (
              <section className="grid gap-5 rounded-xl border border-solid border-[#d9d9e2] bg-[#fafafd] p-5">
                <h2 className="m-0 text-lg font-bold text-[#333344]">
                  Apply for this job
                </h2>

                <JobApplicationForm
                  key={job.id}
                  questions={questions}
                  loading={submitting}
                  onSubmit={handleApply}
                />
              </section>
            ) : (
              <div className="rounded-xl bg-[#f7f6fa] p-5 text-sm text-[#858592]">
                This job is closed or the application deadline has passed.
              </div>
            )}
          </>
        )}
      </div>
    </CandidateLayout>
  );
}
