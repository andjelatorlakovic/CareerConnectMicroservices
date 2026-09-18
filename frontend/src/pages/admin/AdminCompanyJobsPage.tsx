import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { userApi } from '../../api_services/users/UserApiService';
import { jobsApi } from '../../api_services/jobs/JobsApiService';

import type { User } from '../../models/users/User';
import type { JobListing } from '../../models/jobs/JobListing';

import { Role } from '../../models/auth/Role';
import { JobStatus } from '../../models/jobs/JobStatus';

import AdminLayout from '../../components/admin/AdminLayout';
import AdminJobCard from '../../components/admin/AdminJobCard';

export default function AdminCompanyJobsPage() {
  const { userId } = useParams<{ userId: string }>();

  const [companyUser, setCompanyUser] =
    useState<User | null>(null);

  const [jobs, setJobs] = useState<JobListing[]>([]);

  const [loadedUserId, setLoadedUserId] =
    useState<string | null>(null);

  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] =
    useState<'all' | 'active' | 'closed' | 'expired'>('all');

  const loading =
    Boolean(userId) && loadedUserId !== userId;

  useEffect(() => {
    let active = true;

    async function loadCompanyJobs() {
      if (!userId) {
        return;
      }

      try {
        const user = await userApi.getUserById(userId);

        if (user.role !== Role.Company) {
          if (active) {
            setCompanyUser(null);
            setJobs([]);
            setError('Izabrani korisnik nije kompanija.');
          }

          return;
        }

        const data = await jobsApi.getJobsByUser(userId);

        if (active) {
          setCompanyUser(user);

          setJobs(
            [...data].sort(
              (first, second) =>
                new Date(second.createdAt).getTime() -
                new Date(first.createdAt).getTime()
            )
          );

          setError('');
          setActionError('');
          setSuccess('');
          setSearch('');
          setStatusFilter('all');
        }
      } catch {
        if (active) {
          setCompanyUser(null);
          setJobs([]);
          setError('Company jobs could not be loaded.');
        }
      } finally {
        if (active) {
          setLoadedUserId(userId);
        }
      }
    }

    void loadCompanyJobs();

    return () => {
      active = false;
    };
  }, [userId]);

  const handleDeleteJob = async (job: JobListing) => {
    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Do you want to delete the job "${job.title}"?\n\n` +
      'Its related applications and questions will also be deleted.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(job.id);
      setActionError('');
      setSuccess('');

      await userApi.adminRemoveJobListing(job.id);

      setJobs((previous) =>
        previous.filter((item) => item.id !== job.id)
      );

      setSuccess(`Oglas "${job.title}" je obrisan.`);
    } catch {
      setActionError('Job could not be deleted.');
    } finally {
      setDeletingId(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredJobs = jobs.filter((job) => {
    const expired =
      new Date(job.expiresAt).getTime() <= Date.now();

    const matchesSearch =
      `${job.title} ${job.location} ${job.description}`
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesStatus =
      statusFilter === 'all' ||
      (
        statusFilter === 'active' &&
        job.status === JobStatus.Active &&
        !expired
      ) ||
      (
        statusFilter === 'closed' &&
        job.status === JobStatus.Closed
      ) ||
      (
        statusFilter === 'expired' &&
        job.status === JobStatus.Active &&
        expired
      );

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="grid min-h-[86vh] content-start gap-6 rounded-2xl border border-solid border-[#dedde8] bg-white p-5 shadow-xl sm:p-8">
        <Link
          to="/admin/users"
          className="w-fit text-sm font-semibold text-[#c8385c] no-underline hover:underline"
        >
          ← All users
        </Link>

        <header className="border-0 border-b border-solid border-[#ebe9f1] pb-6">
          <h1 className="m-0 text-3xl font-bold tracking-tight text-[#ef476f] sm:text-4xl">
            Company Jobs
          </h1>

          {!loading && companyUser && (
            <p className="m-0 mt-2 text-sm break-all text-[#8c8c9a]">
              Company Account: {companyUser.email}
            </p>
          )}
        </header>

        {loading && (
          <p className="m-0 py-10 text-center text-[#858592]">
            Loading company jobs...
          </p>
        )}

        {(!userId || (!loading && error)) && (
          <div
            role="alert"
            className="rounded-lg border border-solid border-[#f2c5ce] bg-[#fff2f4] p-4 text-[#a43651]"
          >
            {!userId ? 'Company not found.' : error}
          </div>
        )}

        {!loading && !error && companyUser && (
          <>
            {actionError && (
              <div
                role="alert"
                className="rounded-lg border border-solid border-[#f2c5ce] bg-[#fff2f4] p-4 text-[#a43651]"
              >
                {actionError}
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

            <div className="grid gap-4 rounded-xl border border-solid border-[#d9d9e2] bg-[#fafafd] p-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Search Jobs

                <input
                  value={search}
                  placeholder="Title, location or description"
                  onChange={(event) => {
                    setSearch(event.target.value);
                  }}
                  className="w-full rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#ef476f]"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Job Status

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as
                        'all' | 'active' | 'closed' | 'expired'
                    );
                  }}
                  className="w-full rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#ef476f]"
                >
                  <option value="all">All Jobs</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="expired">Expired</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 text-lg font-bold text-[#333344]">
                Published Jobs
              </h2>

              <span className="text-xs text-[#858592]">
                Displayed: {filteredJobs.length} / {jobs.length}
              </span>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="grid justify-items-center gap-3 py-10 text-center">
                <h2 className="m-0 text-lg font-bold text-[#333344]">
                  {jobs.length === 0
                    ? 'Company has no jobs'
                    : 'No jobs available for the selected filters'}
                </h2>
              </div>
            ) : (
              <div className="grid gap-5">
                {filteredJobs.map((job) => (
                  <AdminJobCard
                    key={job.id}
                    job={job}
                    disabled={deletingId !== null}
                    deleting={deletingId === job.id}
                    onDelete={handleDeleteJob}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
