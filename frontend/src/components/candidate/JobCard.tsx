import { Link } from 'react-router-dom';

import type { JobListing } from '../../models/jobs/JobListing';

interface JobCardProps {
  job: JobListing;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <article className="flex overflow-hidden rounded-xl border border-solid border-[#e2dfeb] bg-white transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none">
      <div
        aria-hidden="true"
        className="w-12 shrink-0 bg-[#24233d] sm:w-16"
      />

      <div className="grid min-w-0 flex-1 gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-lg font-bold">
            <Link
              to={`/jobs/${job.id}`}
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

        <p className="m-0 text-sm leading-relaxed break-words text-[#686675]">
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
            Deadline:{' '}
            {new Date(job.expiresAt).toLocaleDateString('sr-Latn-RS')}
          </span>

          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#92919e] no-underline hover:text-[#ef476f]"
          >
            Details

            <span className="grid size-8 place-items-center rounded-lg bg-[#24233d] text-lg text-white">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
