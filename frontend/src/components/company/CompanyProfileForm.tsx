import { useEffect, useState, type FormEvent } from 'react';

import type { CompanyProfile } from '../../models/company/CompanyProfile';
import type { UpdateCompanyProfileRequest } from '../../types/company/UpdateCompanyProfileRequest';

interface CompanyProfileFormProps {
  initial: CompanyProfile;
  loading: boolean;
  onSubmit: (data: UpdateCompanyProfileRequest) => void;
}

export default function CompanyProfileForm({
  initial,
  loading,
  onSubmit,
}: CompanyProfileFormProps) {
  const profileToForm = (): UpdateCompanyProfileRequest => ({
    name: initial.name,
    description: initial.description,
    location: initial.location,
    website: initial.website,
    industry: initial.industry,
    contactEmail: initial.contactEmail,
    contactPhone: initial.contactPhone,
  });
  const [form, setForm] = useState<UpdateCompanyProfileRequest>(profileToForm);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof UpdateCompanyProfileRequest, string>>
  >({});
  const [requiredError, setRequiredError] = useState('');

  useEffect(() => {
    setForm(profileToForm());
  }, [initial]);

  const isDirty = Object.entries(form).some(([key, value]) =>
    value !== initial[key as keyof UpdateCompanyProfileRequest]
  );
  const isInitialProfile =
    !initial.name.trim() ||
    !initial.description.trim() ||
    !initial.location.trim() ||
    !initial.industry.trim() ||
    !initial.contactEmail.trim() ||
    !initial.contactPhone.trim();

  const setField = (
    field: keyof UpdateCompanyProfileRequest,
    value: string
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setRequiredError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredValues = [
      form.name,
      form.industry,
      form.location,
      form.description,
      form.contactEmail,
      form.contactPhone,
    ];

    if (requiredValues.some((value) => !value.trim())) {
      setFieldErrors({});
      setRequiredError('Please complete all required fields.');
      return;
    }

    const errors: Partial<Record<keyof UpdateCompanyProfileRequest, string>> = {};
    if (form.name.trim().length < 2) errors.name = 'Company name must be at least 2 characters long.';
    if (form.industry.trim().length < 2) errors.industry = 'Industry must be at least 2 characters long.';
    if (form.location.trim().length < 2) errors.location = 'Location must be at least 2 characters long.';
    if (form.description.trim().length < 20) errors.description = 'Company description must be at least 20 characters long.';
    if (!/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) errors.contactEmail = 'Enter a valid contact email address.';
    if (!/^[0-9+() -]{6,32}$/.test(form.contactPhone.trim())) errors.contactPhone = 'Enter a valid contact phone number.';
    if (form.website?.trim() && !/^https?:\/\/\S+$/i.test(form.website.trim())) errors.website = 'Enter a valid website address, including https://.';

    if (Object.keys(errors).length > 0) {
      setRequiredError('');
      setFieldErrors(errors);
      return;
    }

    setRequiredError('');
    setFieldErrors({});
    onSubmit(form);
  };

  const inputClassName =
    'w-full rounded-xl border border-solid border-[#d9d9e2] bg-white px-4 py-3 text-sm text-[#333344] outline-none transition focus:border-[#ef476f] focus:ring-4 focus:ring-[#ef476f]/10';

  return (
    <div className="min-h-[86vh] rounded-[28px] border border-solid border-[#e3dfe8] bg-[#f7f7fb] p-4 shadow-xl sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7 rounded-3xl bg-[#24233d] p-6 text-left sm:p-8">
          <h1 className="m-0 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Company profile
          </h1>

          <p className="m-0 mt-3 text-sm leading-relaxed text-[#d3d1e0]">
            Enter information about your company.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <fieldset disabled={loading} className="m-0 grid gap-5 border-0 p-0">
            <section className="rounded-2xl border border-solid border-[#e3dfe8] bg-white p-5 sm:p-6">
              <h2 className="m-0 text-xl font-bold text-[#333344]">
                Basic information
              </h2>

              <p className="m-0 mt-2 text-sm text-[#858592]">
                Information that represents your company to candidates.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[#333344] md:col-span-2">
                  Company name
                  <input
                    value={form.name}
                    onChange={(event) => setField('name', event.target.value)}
                    placeholder="Enter company name"
                    className={inputClassName}
                    required
                    minLength={2}
                    maxLength={120}
                  />
                  {fieldErrors.name && <span role="alert" className="text-sm font-medium text-[#c53659]">{fieldErrors.name}</span>}
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#333344]">
                  Industry
                  <input
                    value={form.industry}
                    onChange={(event) => setField('industry', event.target.value)}
                    placeholder="E.g. IT, finance..."
                    className={inputClassName}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                  {fieldErrors.industry && <span role="alert" className="text-sm font-medium text-[#c53659]">{fieldErrors.industry}</span>}
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#333344]">
                  Location
                  <input
                    value={form.location}
                    onChange={(event) => setField('location', event.target.value)}
                    placeholder="E.g. Novi Sad"
                    className={inputClassName}
                    required
                    minLength={2}
                    maxLength={120}
                  />
                  {fieldErrors.location && <span role="alert" className="text-sm font-medium text-[#c53659]">{fieldErrors.location}</span>}
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#333344] md:col-span-2">
                  Company description
                  <textarea
                    value={form.description}
                    onChange={(event) => setField('description', event.target.value)}
                    placeholder="Describe your company, its services and key information..."
                    rows={6}
                    className={`${inputClassName} min-h-36 resize-y`}
                    required
                    minLength={20}
                    maxLength={2000}
                  />
                  {fieldErrors.description && <span role="alert" className="text-sm font-medium text-[#c53659]">{fieldErrors.description}</span>}
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-solid border-[#e3dfe8] bg-white p-5 sm:p-6">
              <h2 className="m-0 text-xl font-bold text-[#333344]">
                Contact information
              </h2>

              <p className="m-0 mt-2 text-sm text-[#858592]">
                Details candidates can use to contact your company.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[#333344]">
                  Website <span className="font-normal text-[#858592]">(optional)</span>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(event) => setField('website', event.target.value)}
                    placeholder="https://example.com"
                    className={inputClassName}
                    maxLength={300}
                  />
                  {fieldErrors.website && <span role="alert" className="text-sm font-medium text-[#c53659]">{fieldErrors.website}</span>}
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#333344]">
                  Contact email
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) => setField('contactEmail', event.target.value)}
                    placeholder="kontakt@kompanija.com"
                    className={inputClassName}
                    required
                    maxLength={254}
                  />
                  {fieldErrors.contactEmail && <span role="alert" className="text-sm font-medium text-[#c53659]">{fieldErrors.contactEmail}</span>}
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#333344]">
                  Contact phone
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(event) => setField('contactPhone', event.target.value)}
                    placeholder="+381 60 123 4567"
                    className={inputClassName}
                    required
                    minLength={6}
                    maxLength={32}
                    pattern="[0-9+() -]+"
                  />
                  {fieldErrors.contactPhone && <span role="alert" className="text-sm font-medium text-[#c53659]">{fieldErrors.contactPhone}</span>}
                </label>
              </div>
            </section>

            {(isInitialProfile || isDirty) && (
              <>
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-xl border-0 bg-[#ef476f] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#df3d65] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Save profile'}
                </button>
                {requiredError && <p role="alert" className="m-0 text-sm font-medium text-[#c53659]">{requiredError}</p>}
              </>
            )}
          </fieldset>
        </form>
      </div>
    </div>
  );
}
