import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { jobsApi } from '../../api_services/jobs/JobsApiService';

import type { JobListing } from '../../models/jobs/JobListing';
import type { JobFilters } from '../../types/jobs/JobFilters';

import { ExperienceLevel } from '../../models/jobs/ExperienceLevel';
import { Skill } from '../../models/jobs/Skill';

import CandidateLayout from '../../components/candidate/CandidateLayout';
import JobCard from '../../components/candidate/JobCard';
import { useRealtimeEvent } from '../../hooks/realtime/useRealtimeEvent';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [location, setLocation] = useState('');

  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | ''>('');

  const [skills, setSkills] = useState<Skill[]>([]);
  const [filters, setFilters] = useState<JobFilters>({});

  const refreshJobs = useCallback(() => {
    setFilters((previous) => ({ ...previous }));
  }, []);

  useRealtimeEvent<void>('JobListingsChanged', refreshJobs);

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      try {
        const data = await jobsApi.getJobs(filters);

        if (active) {
          setJobs(data);
        }
      } catch {
        if (active) {
          setError('Jobs could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadJobs();

    return () => {
      active = false;
    };
  }, [filters]);

  const handleSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError('');

    setFilters({
      location: location.trim() || undefined,
      experienceLevel: experienceLevel || undefined,
      skills: [...skills],
    });
  };

  const handleReset = () => {
    setLocation('');
    setExperienceLevel('');
    setSkills([]);

    setLoading(true);
    setError('');
    setFilters({});
  };

  return (
    <CandidateLayout>
      <div className="grid min-h-[86vh] content-start gap-7 rounded-[28px] border border-solid border-[#e3dfe8] bg-[#f7f7fb] p-4 shadow-xl sm:p-8">
        <header className="relative isolate overflow-hidden rounded-3xl bg-[#24233d] p-6 sm:p-8">
          <h1 className="m-0 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Job listings
          </h1>

          <p className="m-0 mt-3 text-sm leading-relaxed text-[#d3d1e0]">
            Find jobs by location, experience and skills.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="grid gap-5 rounded-xl border border-solid border-[#d9d9e2] bg-[#fafafd] p-5"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Location

              <input
                value={location}
                placeholder="Grad ili lokacija"
                onChange={(event) => {
                  setLocation(event.target.value);
                }}
                className="w-full rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Experience Level

              <select
                value={experienceLevel}
                onChange={(event) => {
                  setExperienceLevel(
                    event.target.value as ExperienceLevel | ''
                  );
                }}
                className="w-full rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
              >
                <option value="">All levels</option>

                {Object.values(ExperienceLevel).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-3 text-sm font-semibold">
              Required skills
            </legend>

            <div className="flex flex-wrap gap-2">
              {Object.values(Skill).map((skill) => (
                <label
                  key={skill}
                  className={
                    skills.includes(skill)
                      ? 'flex cursor-pointer items-center gap-2 rounded-lg border border-solid border-[#f3ccd7] bg-[#fcebf0] px-3 py-2 text-xs text-[#c8385c]'
                      : 'flex cursor-pointer items-center gap-2 rounded-lg border border-solid border-[#dedbe7] bg-white px-3 py-2 text-xs text-[#696577]'
                  }
                >
                  <input
                    type="checkbox"
                    checked={skills.includes(skill)}
                    onChange={() => {
                      setSkills(
                        skills.includes(skill)
                          ? skills.filter((item) => item !== skill)
                          : [...skills, skill]
                      );
                    }}
                    className="accent-[#ef476f]"
                  />

                  {skill}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer rounded-lg border-0 bg-[#ef476f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#df3d65] disabled:opacity-60"
            >
              Search jobs
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleReset}
              className="cursor-pointer rounded-lg border border-solid border-[#f0c4d0] bg-[#fff3f6] px-5 py-3 text-sm font-semibold text-[#c8385c] hover:bg-[#fce5ec] disabled:opacity-60"
            >
              Reset filters
            </button>
          </div>
        </form>

        {loading && (
          <p className="m-0 py-10 text-center text-[#858592]">
            Loading jobs...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-solid border-[#f2c5ce] bg-[#fff2f4] p-4 text-[#a43651]"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-solid border-[#e6e2eb] bg-white p-5">
              <div>
                <h2 className="m-0 text-xl font-bold text-[#333344]">
                  Published Jobs
                </h2>

                <span className="mt-1 block text-sm text-[#777686]">
                  Browse available job opportunities
                </span>
              </div>

              <span className="rounded-full bg-[#fce8ee] px-3 py-1 text-sm font-bold text-[#c8385c]">
                {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
              </span>
            </div>

            {jobs.length > 0 ? (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="grid justify-items-center gap-3 py-10 text-center">
                <h2 className="m-0 text-lg font-bold text-[#333344]">
                  No matching jobs
                </h2>

                <p className="m-0 text-sm text-[#858592]">
                  Change the filters and try again.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </CandidateLayout>
  );
}
