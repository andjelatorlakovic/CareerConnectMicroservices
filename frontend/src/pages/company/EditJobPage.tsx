import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { jobsApi } from '../../api_services/jobs/JobsApiService';
import CompanyLayout from '../../components/company/CompanyLayout';
import JobForm from '../../components/company/JobForm';

import type { JobListing } from '../../models/jobs/JobListing';
import type { JobFormData } from '../../types/jobs/JobFormData';
import type { UpdateJobRequest } from '../../types/jobs/UpdateJobRequest';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadJob = async () => {
      try {
        setLoading(true);
        setError('');

        const jobId: string = id;
        const data = await jobsApi.getJobById(jobId);

        setJob(data);
      } catch {
        setError('Job not found.');
      } finally {
        setLoading(false);
      }
    };

    void loadJob();
  }, [id]);

  const handleSubmit = async (form: JobFormData) => {
    if (!job) {
      return;
    }

    const request: UpdateJobRequest = {
      title: form.title,
      description: form.description,
      location: form.location,
      experienceLevel: form.experienceLevel,
      jobCategory: form.jobCategory,
      employmentType: form.employmentType,
      expiresAt: new Date(form.expiresAt).toISOString(),
      skills: form.skills,
      salaryMin: form.salaryMin
        ? Number(form.salaryMin)
        : null,
      salaryMax: form.salaryMax
        ? Number(form.salaryMax)
        : null,
    };

    try {
      setLoading(true);
      setError('');

      await jobsApi.updateJob(job.id, request);

      navigate('/my-jobs');
    } catch {
      setError('Job could not be updated.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyLayout>

      {error && <p>{error}</p>}

      {job && (
        <JobForm
          initial={{
            title: job.title,
            description: job.description,
            location: job.location,
            experienceLevel: job.experienceLevel,
            jobCategory: job.jobCategory,
            employmentType: job.employmentType,
            expiresAt: job.expiresAt,
            skills: job.skills,
            salaryMin: job.salaryMin?.toString() ?? '',
            salaryMax: job.salaryMax?.toString() ?? '',
          }}
          loading={loading}
          submitLabel="Save changes"
          title="Uredite oglas"
          subtitle="Update the position information and save your changes."
          onBack={() => navigate(`/my-jobs/${job.id}`)}
          onSubmit={(form) => void handleSubmit(form)}
        />
      )}
    </CompanyLayout>
  );
}
