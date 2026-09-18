import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { jobsApi } from '../../api_services/jobs/JobsApiService';
import CompanyLayout from '../../components/company/CompanyLayout';

import type { JobListing } from '../../models/jobs/JobListing';
import { JobStatus } from '../../models/jobs/JobStatus';
import { useRealtimeEvent } from '../../hooks/realtime/useRealtimeEvent';

export default function MyJobsPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshMyJobs = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  useRealtimeEvent<void>('JobListingsChanged', refreshMyJobs);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await jobsApi.getMyJobs();
        setJobs(data);
      } catch {
        setError('Jobs could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    void loadJobs();
  }, [refreshKey]);

  const activeJobs = jobs.filter(
    (job) => job.status === JobStatus.Active
  ).length;
  const inactiveJobs = jobs.length - activeJobs;

  return (
    <CompanyLayout>
      <div className="jobs-page !min-h-0 !bg-transparent !p-0">

        <div className="jobs-container !min-h-[86vh] !rounded-[28px] !border !border-solid !border-[#e3dfe8] !bg-[#f7f7fb] !p-4 !shadow-xl sm:!p-8">

          {/* HEADER */}

          <div className="jobs-header !flex !flex-col !items-start !justify-between !gap-5 !rounded-3xl !bg-[#24233d] !p-6 sm:!flex-row sm:!items-center sm:!p-8">

            <div className="header-left !flex !items-center !gap-4">

              <div>

                <div className="title-row !flex !items-center !gap-3">

                  <h1 className="!m-0 !text-3xl !font-bold !tracking-tight !text-white sm:!text-4xl">
                    My Jobs
                  </h1>

                </div>

                <p className="!mb-0 !mt-2 !text-base !text-[#d3d1e0]">
                  View and manage your company job listings.
                </p>

              </div>

            </div>

            <button
              type="button"
              className="add-job-button !inline-flex !items-center !gap-2 !rounded-xl !border-0 !bg-[#ef476f] !px-7 !py-4 !text-base !font-bold !text-white hover:!bg-[#d9365f]"
              onClick={() =>
                navigate('/create-job')
              }
            >
              <span className="plus-icon">
                +
              </span>

              Add Job
            </button>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="state-container !grid !min-h-72 !place-items-center !gap-3 !text-[#666576]">

              <div className="spinner" />

              <p>
                Loading jobs...
              </p>

            </div>
          )}

          {/* ERROR */}

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

          {/* EMPTY */}

          {!loading &&
            !error &&
            jobs.length === 0 && (
              <div className="empty-container !mx-auto !mt-10 !grid !max-w-xl !justify-items-center !gap-3 !rounded-2xl !border !border-dashed !border-[#d9d9e2] !bg-white !p-10 !text-center">

                <div className="empty-icon">
                  <span>＋</span>
                </div>

                <h2 className="!m-0 !text-xl !font-bold !text-[#333344]">
                  You do not have any jobs yet
                </h2>

                <p className="!m-0 !text-[#777686]">
                  Publish your first job and find
                  suitable candidates.
                </p>

                <button
                  type="button"
                  className="!mt-2 !inline-flex !items-center !gap-2 !rounded-xl !border-0 !bg-[#ef476f] !px-5 !py-3 !font-bold !text-white hover:!bg-[#d9365f]"
                  onClick={() =>
                    navigate('/create-job')
                  }
                >
                  <span>
                    +
                  </span>

                  Add Job
                </button>

              </div>
            )}

          {/* JOBS */}

          {!loading &&
            !error &&
            jobs.length > 0 && (
              <div className="jobs-content">

                {/* STATISTICS */}

                <div className="stats-grid !mt-6 !grid !grid-cols-1 !gap-5 sm:!grid-cols-2 lg:[&.stats-grid]:!grid-cols-2">

                  {/* TOTAL */}

                  <div className="stat-card total-card !flex !min-h-24 !w-full !items-center !gap-4 !rounded-2xl !border !border-solid !border-[#e6e2eb] !bg-white !p-4 !shadow-sm">

                    <div className="stat-icon !grid !size-11 !place-items-center !rounded-xl !bg-[#e9f7ed] !text-xl !font-bold !text-[#2c7b48]">
                      <span>✓</span>
                    </div>

                    <div className="stat-info !flex !flex-col !items-start !justify-center !gap-2">

                      <span className="!block !text-xs !font-bold !uppercase !tracking-wide !text-[#858592]">
                        Ukupno aktivnih
                      </span>

                      <strong className="!block !text-2xl !font-bold !leading-none !text-[#2c7b48]">
                        {activeJobs}
                      </strong>

                    </div>

                  </div>

                  {/* ACTIVE */}

                  <div className="stat-card active-card !flex !min-h-24 !w-full !items-center !gap-4 !rounded-2xl !border !border-solid !border-[#e6e2eb] !bg-white !p-4 !shadow-sm">

                    <div className="stat-icon !grid !size-11 !place-items-center !rounded-xl !bg-[#fff2f4] !text-xl !font-bold !text-[#c8385c]">
                      <span>×</span>
                    </div>

                    <div className="stat-info !flex !flex-col !items-start !justify-center !gap-2">

                      <span className="!block !text-xs !font-bold !uppercase !tracking-wide !text-[#858592]">
                        Total Inactive
                      </span>

                      <strong className="!block !text-2xl !font-bold !leading-none !text-[#c8385c]">
                        {inactiveJobs}
                      </strong>

                    </div>

                  </div>

                </div>

                {/* LIST HEADER */}

                <div className="list-header !mt-8 !flex !flex-wrap !items-center !justify-between !gap-4 !rounded-2xl !border !border-solid !border-[#e6e2eb] !bg-white !p-5">

                  <div>

                    <h2 className="!m-0 !text-xl !font-bold !text-[#333344]">
                      Published Jobs
                    </h2>

                    <span className="!mt-1 !block !text-sm !text-[#777686]">
                      Select a job to view details
                    </span>

                  </div>

                  <span className="job-count !rounded-full !bg-[#fce8ee] !px-3 !py-1 !text-sm !font-bold !text-[#c8385c]">
                    {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
                  </span>

                </div>

                {/* JOB LIST */}

                <div className="jobs-list !mt-4 !grid !gap-4">

                  {jobs.map((job) => {
                    return (
                      <article
                        key={job.id}
                        className="flex cursor-pointer overflow-hidden rounded-xl border border-solid border-[#e2dfeb] bg-white transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none"
                        onClick={() =>
                          navigate(
                            `/my-jobs/${job.id}`
                          )
                        }
                        onKeyDown={(event) => {

                          if (
                            event.key === 'Enter' ||
                            event.key === ' '
                          ) {
                            navigate(
                              `/my-jobs/${job.id}`
                            );
                          }

                        }}
                        role="button"
                        tabIndex={0}
                      >

                        <div
                          aria-hidden="true"
                          className="w-12 shrink-0 bg-[#24233d] sm:w-16"
                        />
                        <div className="grid min-w-0 flex-1 gap-4 p-4 sm:p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="m-0 text-lg font-bold">
                              <Link
                                to={`/my-jobs/${job.id}`}
                                className="break-words text-[#393848] no-underline hover:text-[#ef476f]"
                              >
                                {job.title}
                              </Link>
                            </h2>
                            <span className="rounded-md bg-[#e9e5f5] px-3 py-1 text-xs font-bold text-[#5c5576]">
                              {job.experienceLevel}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#858592]">
                            <span>⌖ {job.location}</span>
                            <span>{job.employmentType}</span>
                            <span>{job.jobCategory}</span>
                          </div>

                          <p className="m-0 break-words text-sm leading-relaxed text-[#686675]">
                            {job.description.length > 180
                              ? `${job.description.slice(0, 180)}...`
                              : job.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-solid border-[#f3ccd7] bg-[#fcebf0] px-3 py-1 text-xs font-semibold text-[#c8385c]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs text-[#858592]">
                              Deadline: {new Date(job.expiresAt).toLocaleDateString('sr-Latn-RS')}
                            </span>
                            <Link
                              to={`/my-jobs/${job.id}`}
                              className="inline-flex items-center gap-2 text-xs font-bold text-[#92919e] no-underline hover:text-[#ef476f]"
                            >
                              Details
                              <span className="grid size-8 place-items-center rounded-lg bg-[#24233d] text-lg text-white">→</span>
                            </Link>
                          </div>
                        </div>

                      </article>
                    );
                  })}

                </div>

              </div>
            )}

        </div>

      </div>    </CompanyLayout>
  );
}
