import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { matchingApi } from '../../api_services/matching/MatchingApiService';

import type { MatchResult } from '../../models/matching/MatchResult';

import CandidateLayout from '../../components/candidate/CandidateLayout';
import { useRealtimeEvent } from '../../hooks/realtime/useRealtimeEvent';

export default function MatchingJobsPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshMatches = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  useRealtimeEvent<void>('JobListingsChanged', refreshMatches);

  useEffect(() => {
    let active = true;

    async function loadMatchingJobs() {
      try {
        const data = await matchingApi.getMatchingJobs();

        if (active) {
          setMatches(data);
        }
      } catch {
        if (active) {
          setError('Recommended jobs could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadMatchingJobs();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <CandidateLayout>
      <div className="grid min-h-[86vh] content-start gap-7 rounded-[28px] border border-solid border-[#e3dfe8] bg-[#f7f7fb] p-4 shadow-xl sm:p-8">
        <header className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-3xl bg-[#24233d] p-6 sm:p-8">
          <div>
            <h1 className="m-0 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Recommended jobs
            </h1>

            <p className="m-0 mt-3 text-sm leading-relaxed text-[#d3d1e0]">
              Recommendations based on your desired categories and skills.
            </p>
          </div>

        </header>

        {loading && (
          <p className="m-0 py-10 text-center text-[#858592]">
            Loading recommendations...
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
          matches.length === 0 ? (
            <div className="grid justify-items-center gap-4 py-10 text-center">
              <h2 className="m-0 text-lg font-bold text-[#333344]">
                No recommendations found
              </h2>

              <p className="m-0 max-w-xl text-sm leading-relaxed text-[#858592]">
                Add skills and desired job categories to your profile.
                Recommendations are shown when matching jobs are found based on your profile.
              </p>

              <Link
                to="/candidate-profile"
                className="rounded-lg bg-[#ef476f] px-5 py-3 font-semibold text-white no-underline hover:bg-[#df3d65]"
              >
                Update Profile
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {matches.map((match) => (
                <article
                  key={match.jobId}
                  className="grid gap-4 rounded-xl border border-solid border-[#e3dfeb] border-l-4 border-l-[#24233d] bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="m-0 text-lg font-bold text-[#333344]">
                      {match.tittle}
                    </h2>

                    <span className="rounded-lg border border-solid border-[#f2ccd8] bg-[#fce8ee] px-3 py-2 text-sm font-bold text-[#c8385c]">
                      {match.matchPercentage.toLocaleString(
                        'sr-Latn-RS',
                        { maximumFractionDigits: 2 }
                      )}
                      % match
                    </span>
                  </div>

                  <p className="m-0 text-xs text-[#858592]">
                    {match.location} · {match.jobCategory}
                  </p>

                  <progress
                    max={100}
                    value={match.matchPercentage}
                    aria-label="Skill match percentage"
                    className="h-3 w-full accent-[#ef476f]"
                  />

                  <h3 className="m-0 text-sm font-bold text-[#333344]">
                    Skills you have
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {match.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-solid border-[#d1e9d9] bg-[#e9f7ed] px-3 py-2 text-xs font-semibold text-[#2c7b48]"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>

                  {match.missingSkills.length > 0 && (
                    <>
                      <h3 className="m-0 text-sm font-bold text-[#333344]">
                        Skills missing from your profile
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {match.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-solid border-[#f3ccd7] bg-[#fff0f3] px-3 py-2 text-xs font-semibold text-[#b63255]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  <Link
                    to={`/jobs/${match.jobId}`}
                    className="w-fit rounded-lg bg-[#ef476f] px-5 py-3 text-sm font-semibold text-white no-underline hover:bg-[#df3d65]"
                  >
                    View Job Details
                  </Link>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </CandidateLayout>
  );
}
