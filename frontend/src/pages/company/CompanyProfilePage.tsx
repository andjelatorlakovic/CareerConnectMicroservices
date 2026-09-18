import { useEffect, useState } from 'react';

import { companyApi } from '../../api_services/company/CompanyApiService';
import CompanyLayout from '../../components/company/CompanyLayout';
import CompanyProfileForm from '../../components/company/CompanyProfileForm';

import type { CompanyProfile } from '../../models/company/CompanyProfile';
import type { UpdateCompanyProfileRequest } from '../../types/company/UpdateCompanyProfileRequest';

export default function CompanyProfilePage() {
  const [profile, setProfile] =
    useState<CompanyProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSuccess(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [success]);

  useEffect(() => {
    async function loadProfile() {
      try {
        setProfile(await companyApi.getCompanyProfile());
      } catch {
        setError('Company profile could not be loaded.');
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  const handleSubmit = async (
    data: UpdateCompanyProfileRequest
  ) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updated = await companyApi.updateCompanyProfile(
        data
      );

      setProfile(updated);
      setSuccess('Profile saved successfully.');
    } catch {
      setError('Company profile could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CompanyLayout>


      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {success && (
        <div
          role="status"
          className="fixed right-5 top-5 z-50 rounded-xl border border-solid border-[#d5ebdd] bg-[#edf8f1] px-5 py-4 text-sm font-semibold text-[#287648] shadow-lg"
        >
          ✓ {success}
        </div>
      )}

      {profile && (
        <CompanyProfileForm
          initial={profile}
          loading={saving}
          onSubmit={(data) => void handleSubmit(data)}
        />
      )}
    </CompanyLayout>
  );
}
