import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { jobsApi } from '../../api_services/jobs/JobsApiService';
import CompanyLayout from '../../components/company/CompanyLayout';

import type { JobListing } from '../../models/jobs/JobListing';
import { JobStatus } from '../../models/jobs/JobStatus';

export default function MyJobDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError('Job not found.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await jobsApi.getJobById(id);
        setJob(data);
      } catch {
        setError('Job could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    void loadJob();
  }, [id]);

  const handleClose = async () => {
    if (!job) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to close this job?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setClosing(true);
      setError('');

      await jobsApi.closeJob(job.id);

      setJob({
        ...job,
        status: JobStatus.Closed,
      });
    } catch {
      setError('Job could not be closed.');
    } finally {
      setClosing(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatSalary = (
    salaryMin: number | null,
    salaryMax: number | null
  ) => {
    if (salaryMin === null && salaryMax === null) {
      return 'Not specified';
    }

    if (salaryMin !== null && salaryMax !== null) {
      return `${salaryMin.toLocaleString(
        'sr-RS'
      )} - ${salaryMax.toLocaleString('sr-RS')} RSD`;
    }

    if (salaryMin !== null) {
      return `Od ${salaryMin.toLocaleString('sr-RS')} RSD`;
    }

    return `Do ${salaryMax!.toLocaleString('sr-RS')} RSD`;
  };

  if (loading) {
    return (
      <CompanyLayout>
        <div className="details-page">
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading job...</p>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  if (error || !job) {
    return (
      <CompanyLayout>
        <div className="details-page">
          <div className="details-container error-container">
            <div className="error-icon">!</div>

            <h2>Job is not available</h2>

            <p>
              {error || 'The requested job was not found.'}
            </p>

            <button
              type="button"
              className="back-main-button"
              onClick={() => navigate('/my-jobs')}
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  const isActive = job.status === JobStatus.Active;

  return (
    <CompanyLayout>
      <div className="details-page !min-h-0 !bg-transparent !p-0">

        <div className="details-container !min-h-[86vh] !rounded-[28px] !border !border-solid !border-[#e3dfe8] !bg-[#f7f7fb] !p-4 !shadow-xl sm:!p-8">

          {/* BACK */}

          <button
            type="button"
            className="back-button !mb-7 !inline-flex !items-center !gap-3 !border-0 !bg-transparent !p-0 !text-base !font-bold !text-[#c8385c] hover:!underline"
            onClick={() => navigate('/my-jobs')}
          >
            <span>←</span>
            My Jobs
          </button>

          {/* HEADER */}

          <div className="job-header !rounded-3xl !border-0 !bg-[#24233d] !p-6 sm:!p-8">

            <div className="job-header-main !flex !items-center !gap-4">

              <div className="job-icon !grid !size-12 !place-items-center !rounded-2xl !bg-[#ef476f] !text-xl">
                💼
              </div>

              <div className="job-heading">

                <div className="job-title-row !flex !flex-wrap !items-center !gap-3">

                  <h1 className="!m-0 !text-3xl !font-bold !tracking-tight !text-white sm:!text-4xl">{job.title}</h1>

                  <span
                    className={`${
                      isActive
                        ? 'status active'
                        : 'status closed'
                    } !rounded-full !px-3 !py-1 !text-xs !font-bold ${isActive ? '!bg-[#e9f7ed] !text-[#2c7b48]' : '!bg-[#f3f1f5] !text-[#777686]'}`}
                  >
                    <span className="status-dot" />

                    {isActive
                      ? 'Active'
                      : 'Closed'}
                  </span>

                </div>

                <p className="!mb-0 !mt-2 !text-[#d3d1e0]">
                  Details and information about the job posting
                </p>

              </div>

            </div>
          </div>

          {/* MANAGEMENT */}

          <div className="management-panel !mt-6 !flex !flex-col !gap-5 !rounded-2xl !border !border-solid !border-[#e6e2eb] !bg-white !p-5 lg:!flex-row lg:!items-center lg:!justify-between">

            <div className="management-info !flex !items-center !gap-4">

              <div className="management-icon !grid !size-11 !place-items-center !rounded-xl !bg-[#fce8ee] !text-lg">
                ⚙
              </div>

              <div>
                <h2 className="!m-0 !text-xl !font-bold !text-[#333344]">Job Management</h2>

                <p className="!mb-0 !mt-1 !text-sm !text-[#777686]">
                  Select the action you want to perform
                </p>
              </div>

            </div>

            <div className="management-actions !flex !flex-wrap !gap-3">

              <button
                type="button"
                className="management-button !rounded-xl !border-0 !bg-[#ef476f] !px-4 !py-3 !font-semibold !text-white hover:!bg-[#d9365f]"
                onClick={() =>
                  navigate(`/edit-job/${job.id}`)
                }
              >
                <span className="button-icon">
                  ✎
                </span>

                <span>
                  Edit Job
                </span>
              </button>

              <button
                type="button"
                className="management-button !rounded-xl !border-0 !bg-[#ef476f] !px-4 !py-3 !font-semibold !text-white hover:!bg-[#d9365f]"
                onClick={() =>
                  navigate(
                    `/my-jobs/${job.id}/applications`
                  )
                }
              >
                <span className="button-icon">
                  👥
                </span>

                <span>
                  Prijave
                </span>
              </button>

              <button
                type="button"
                className="management-button !rounded-xl !border-0 !bg-[#ef476f] !px-4 !py-3 !font-semibold !text-white hover:!bg-[#d9365f]"
                onClick={() =>
                  navigate(
                    `/my-jobs/${job.id}/questions`
                  )
                }
              >
                <span className="button-icon">
                  ?
                </span>

                <span>
                  Questions
                </span>
              </button>

              {isActive && (
                <button
                  type="button"
                  className="close-button !rounded-xl !border !border-solid !border-[#f0c4d0] !bg-[#fff3f6] !px-4 !py-3 !font-semibold !text-[#c8385c] hover:!bg-[#fce5ec] disabled:!opacity-60"
                  onClick={() => void handleClose()}
                  disabled={closing}
                >
                  {closing
                    ? 'Closing...'
                    : 'Close Job'}
                </button>
              )}

            </div>

          </div>

          {/* MAIN CONTENT */}

          <div className="details-content">

            <main className="details-main !grid !gap-5">

              {/* BASIC INFORMATION */}

              <section className="content-section !rounded-2xl !border !border-solid !border-[#e6e2eb] !bg-white !p-5">

                <div className="section-heading !mb-5 !flex !items-start !gap-3">

                  <div className="section-accent !mt-1 !h-9 !w-1 !rounded-full !bg-[#ef476f]" />

                  <div>
                    <h2 className="!m-0 !text-xl !font-bold !text-[#333344]">
                      Basic Information
                    </h2>

                    <p className="!mb-0 !mt-1 !text-sm !text-[#777686]">
                      Information about the position and working conditions
                    </p>
                  </div>

                </div>

                <div className="info-grid !grid !grid-cols-1 !gap-3 sm:!grid-cols-2 lg:!grid-cols-3">

                  <div className="info-card pink-card !flex !items-center !gap-3 !rounded-xl !border !border-solid !border-[#e6e2eb] !bg-[#f8f8fc] !p-4">

                    <span className="info-icon">
                      📍
                    </span>

                    <div className="!grid !gap-1">
                      <span className="info-label !text-xs !font-semibold !text-[#858592]">
                        Location
                      </span>

                      <strong className="!text-base !font-bold !text-[#333344]">
                        {job.location}
                      </strong>
                    </div>

                  </div>

                  <div className="info-card purple-card !flex !items-center !gap-3 !rounded-xl !border !border-solid !border-[#e6e2eb] !bg-[#f8f8fc] !p-4">

                    <span className="info-icon">
                      💼
                    </span>

                    <div className="!grid !gap-1">
                      <span className="info-label !text-xs !font-semibold !text-[#858592]">
                        Employment Type
                      </span>

                      <strong className="!text-base !font-bold !text-[#333344]">
                        {job.employmentType}
                      </strong>
                    </div>

                  </div>

                  <div className="info-card blue-card !flex !items-center !gap-3 !rounded-xl !border !border-solid !border-[#e6e2eb] !bg-[#f8f8fc] !p-4">

                    <span className="info-icon">
                      🎓
                    </span>

                    <div className="!grid !gap-1">
                      <span className="info-label !text-xs !font-semibold !text-[#858592]">
                        Experience Level
                      </span>

                      <strong className="!text-base !font-bold !text-[#333344]">
                        {job.experienceLevel}
                      </strong>
                    </div>

                  </div>

                  <div className="info-card green-card !flex !items-center !gap-3 !rounded-xl !border !border-solid !border-[#e6e2eb] !bg-[#f8f8fc] !p-4">

                    <span className="info-icon">
                      🏷
                    </span>

                    <div className="!grid !gap-1">
                      <span className="info-label !text-xs !font-semibold !text-[#858592]">
                        Category
                      </span>

                      <strong className="!text-base !font-bold !text-[#333344]">
                        {job.jobCategory}
                      </strong>
                    </div>

                  </div>

                  <div className="info-card salary-card !flex !items-center !gap-3 !rounded-xl !border !border-solid !border-[#e6e2eb] !bg-[#f8f8fc] !p-4">

                    <span className="info-icon">
                      💰
                    </span>

                    <div className="!grid !gap-1">
                      <span className="info-label !text-xs !font-semibold !text-[#858592]">
                        Salary
                      </span>

                      <strong className="!text-base !font-bold !text-[#333344]">
                        {formatSalary(
                          job.salaryMin,
                          job.salaryMax
                        )}
                      </strong>
                    </div>

                  </div>

                  <div className="info-card date-card !flex !items-center !gap-3 !rounded-xl !border !border-solid !border-[#e6e2eb] !bg-[#f8f8fc] !p-4">

                    <span className="info-icon">
                      📅
                    </span>

                    <div className="!grid !gap-1">
                      <span className="info-label !text-xs !font-semibold !text-[#858592]">
                        Application Deadline
                      </span>

                      <strong className="!text-base !font-bold !text-[#333344]">
                        {job.expiresAt
                          ? formatDate(job.expiresAt)
                          : 'Not specified'}
                      </strong>
                    </div>

                  </div>

                </div>

              </section>

              {/* DESCRIPTION */}

              <section className="content-section !rounded-2xl !border !border-solid !border-[#e6e2eb] !bg-white !p-5">

                <div className="section-heading !mb-5 !flex !items-start !gap-3">

                  <div className="section-accent !mt-1 !h-9 !w-1 !rounded-full !bg-[#ef476f]" />

                  <div>
                    <h2 className="!m-0 !text-xl !font-bold !text-[#333344]">
                      Job Description
                    </h2>

                    <p className="!mb-0 !mt-1 !text-sm !text-[#777686]">
                      Detailed description of the job position
                    </p>
                  </div>

                </div>

                <div className="description-card !rounded-xl !bg-[#f8f8fc] !p-5 !text-[#4d4c5e]">

                  <p className="!m-0 !leading-relaxed !whitespace-pre-wrap">
                    {job.description}
                  </p>

                </div>

              </section>

              {/* SKILLS */}

              <section className="content-section !rounded-2xl !border !border-solid !border-[#e6e2eb] !bg-white !p-5">

                <div className="section-heading !mb-5 !flex !items-start !gap-3">

                  <div className="section-accent !mt-1 !h-9 !w-1 !rounded-full !bg-[#ef476f]" />

                  <div>
                    <h2 className="!m-0 !text-xl !font-bold !text-[#333344]">
                      Required skills
                    </h2>

                    <p className="!mb-0 !mt-1 !text-sm !text-[#777686]">
                      Skills and technologies the candidate should have
                    </p>
                  </div>

                </div>

                {job.skills && job.skills.length > 0 ? (

                  <div className="skills-container !flex !flex-wrap !gap-2">

                    {job.skills.map(
                      (skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="skill-tag !rounded-full !border !border-solid !border-[#f3ccd7] !bg-[#fcebf0] !px-3 !py-2 !text-sm !font-semibold !text-[#c8385c]"
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                ) : (

                  <div className="no-skills !rounded-xl !bg-[#f8f8fc] !p-4 !text-sm !text-[#777686]">
                    No specific skills listed.
                  </div>

                )}

              </section>

            </main>

          </div>

          {error && (
            <div className="action-error !mt-5 !rounded-xl !border !border-solid !border-[#f2c5ce] !bg-[#fff2f4] !p-4 !text-[#a43651]">
              <span>!</span>
              {error}
            </div>
          )}

        </div>
      </div>    </CompanyLayout>
  );
}
