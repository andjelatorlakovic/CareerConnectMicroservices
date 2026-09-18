import type { JobListing } from '../../models/jobs/JobListing';

import { JobStatus } from '../../models/jobs/JobStatus';

interface AdminJobCardProps {
  job: JobListing;
  disabled: boolean;
  deleting: boolean;

  onDelete: (job: JobListing) => Promise<void>;
}

export default function AdminJobCard({
  job,
  disabled,
  deleting,
  onDelete,
}: AdminJobCardProps) {
  const isExpired =
    new Date(job.expiresAt).getTime() <= Date.now();

  const isClosed = job.status === JobStatus.Closed;

  return (
    <article className="grid gap-5 rounded-xl border border-solid border-[#e3dfeb] border-l-4 border-l-[#24233d] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid min-w-0 gap-2">
          <h2 className="m-0 text-xl font-bold break-words text-[#333344]">
            {job.title}
          </h2>

          <p className="m-0 text-sm text-[#858592]">
            {job.location}
          </p>
        </div>

        <span
          className={
            isClosed
              ? 'rounded-md bg-[#eeedf3] px-3 py-2 text-xs font-bold text-[#777785]'
              : isExpired
                ? 'rounded-md bg-[#fff6df] px-3 py-2 text-xs font-bold text-[#896619]'
                : 'rounded-md bg-[#e9f7ed] px-3 py-2 text-xs font-bold text-[#2c7b48]'
          }
        >
          {isClosed
            ? 'Closed'
            : isExpired
              ? 'Expired'
              : 'Active'}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="grid gap-1 rounded-lg bg-[#f6f3fb] p-3">
          <span className="text-xs text-[#92919e]">
            Kategorija
          </span>

          <strong className="text-sm break-words">
            {job.jobCategory}
          </strong>
        </div>

        <div className="grid gap-1 rounded-lg bg-[#f1f5fb] p-3">
          <span className="text-xs text-[#92919e]">
            Tip zaposlenja
          </span>

          <strong className="text-sm">
            {job.employmentType}
          </strong>
        </div>

        <div className="grid gap-1 rounded-lg bg-[#fff4f6] p-3">
          <span className="text-xs text-[#92919e]">
            Nivo iskustva
          </span>

          <strong className="text-sm">
            {job.experienceLevel}
          </strong>
        </div>

        <div className="grid gap-1 rounded-lg bg-[#f0f8f3] p-3">
          <span className="text-xs text-[#92919e]">
            Date of posting
          </span>

          <strong className="text-sm">
            {new Date(job.createdAt).toLocaleDateString('sr-Latn-RS')}
          </strong>
        </div>

        <div className="grid gap-1 rounded-lg bg-[#f5f3f8] p-3">
          <span className="text-xs text-[#92919e]">
            Deadline for applications
          </span>

          <strong className="text-sm">
            {new Date(job.expiresAt).toLocaleDateString('sr-Latn-RS')}
          </strong>
        </div>

        <div className="grid gap-1 rounded-lg bg-[#f8f5ed] p-3">
          <span className="text-xs text-[#92919e]">
            Salary
          </span>

          <strong className="text-sm">
            {job.salaryMin !== null && job.salaryMax !== null
              ? `${job.salaryMin.toLocaleString('sr-Latn-RS')} – ${job.salaryMax.toLocaleString('sr-Latn-RS')}`
              : job.salaryMin !== null
                ? `Od ${job.salaryMin.toLocaleString('sr-Latn-RS')}`
                : job.salaryMax !== null
                  ? `Do ${job.salaryMax.toLocaleString('sr-Latn-RS')}`
                  : ' Not specified'}
          </strong>
        </div>
      </div>

      <section className="grid gap-2">
        <h3 className="m-0 text-sm font-bold text-[#333344]">
          Position Description
        </h3>

        <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#5e5d6c]">
          {job.description}
        </p>
      </section>

      <section className="grid gap-3">
        <h3 className="m-0 text-sm font-bold text-[#333344]">
          Required skills
        </h3>

        {job.skills.length === 0 ? (
          <p className="m-0 text-sm text-[#858592]">
            No skills listed.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-solid border-[#f3ccd7] bg-[#fcebf0] px-3 py-2 text-xs font-semibold text-[#c8385c]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-end border-0 border-t border-solid border-[#ebe9f1] pt-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            void onDelete(job);
          }}
          className="cursor-pointer rounded-lg border-0 bg-[#ef476f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d9365f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? 'Deleting...' : 'Delete job'}
        </button>
      </div>
    </article>
  );
}
