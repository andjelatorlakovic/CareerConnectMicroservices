import { useEffect, useState, type FormEvent } from 'react';

import type { CandidateProfile } from '../../models/candidate/CandidateProfile';
import type { UpdateCandidateProfileRequest } from '../../types/candidate/UpdateCandidateProfileRequest';

import { ExperienceLevel } from '../../models/jobs/ExperienceLevel';
import { JobCategory } from '../../models/jobs/JobCategory';
import { Skill } from '../../models/jobs/Skill';

interface CandidateProfileFormProps {
  initial: CandidateProfile;
  loading: boolean;

  onSubmit: (
    request: UpdateCandidateProfileRequest
  ) => Promise<void>;
}

export default function CandidateProfileForm({
  initial,
  loading,
  onSubmit,
}: CandidateProfileFormProps) {
  const profileToForm = (): UpdateCandidateProfileRequest =>
    ({
      bio: initial.bio,
      location: initial.location,
      experienceLevel: initial.experienceLevel,
      skills: [...initial.skills],
      desiredJobCategories: [...initial.desiredJobCategories],
    });
  const [form, setForm] = useState<UpdateCandidateProfileRequest>(profileToForm);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setForm(profileToForm());
  }, [initial]);

  const isDirty =
    form.bio !== initial.bio ||
    form.location !== initial.location ||
    form.experienceLevel !== initial.experienceLevel ||
    JSON.stringify(form.skills) !== JSON.stringify(initial.skills) ||
    JSON.stringify(form.desiredJobCategories) !==
      JSON.stringify(initial.desiredJobCategories);
  const isInitialProfile =
    !initial.bio.trim() ||
    !initial.location.trim() ||
    initial.skills.length === 0 ||
    initial.desiredJobCategories.length === 0;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      form.skills.length === 0 ||
      form.desiredJobCategories.length === 0
    ) {
      setValidationError(
        'Select at least one skill and one desired job category.'
      );
      return;
    }

    setValidationError('');

    await onSubmit({
      ...form,
      bio: form.bio.trim(),
      location: form.location.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset
        disabled={loading}
        className="m-0 grid min-w-0 gap-5 border-0 p-0"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Location

            <input
              value={form.location}
              placeholder="E.g. Novi Sad"
              onChange={(event) => {
                setForm({
                  ...form,
                  location: event.target.value,
                });
              }}
              className="w-full rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm text-[#333344] outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
              required
              minLength={2}
              maxLength={120}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Experience level

            <select
              value={form.experienceLevel}
              onChange={(event) => {
                setForm({
                  ...form,
                  experienceLevel:
                    event.target.value as ExperienceLevel,
                });
              }}
              className="w-full rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm text-[#333344] outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
            >
              {Object.values(ExperienceLevel).map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold">
          About me

          <textarea
            value={form.bio}
            placeholder="Tell us about your experience and interests."
            onChange={(event) => {
              setForm({
                ...form,
                bio: event.target.value,
              });
            }}
            className="min-h-36 w-full resize-y rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm leading-relaxed text-[#333344] outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
            required
            minLength={20}
            maxLength={2000}
          />
        </label>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="mb-3 text-sm font-semibold">
            Skills
          </legend>

          <div className="flex flex-wrap gap-2">
            {Object.values(Skill).map((skill) => (
              <label
                key={skill}
                className={
                  form.skills.includes(skill)
                    ? 'flex cursor-pointer items-center gap-2 rounded-lg border border-solid border-[#f3ccd7] bg-[#fcebf0] px-3 py-2 text-xs font-semibold text-[#c8385c]'
                    : 'flex cursor-pointer items-center gap-2 rounded-lg border border-solid border-[#dedbe7] bg-white px-3 py-2 text-xs font-semibold text-[#696577]'
                }
              >
                <input
                  type="checkbox"
                  checked={form.skills.includes(skill)}
                  onChange={() => {
                    setForm({
                      ...form,
                      skills: form.skills.includes(skill)
                        ? form.skills.filter((item) => item !== skill)
                        : [...form.skills, skill],
                    });
                  }}
                  className="accent-[#ef476f]"
                />

                {skill}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="mb-3 text-sm font-semibold">
            Desired job categories
          </legend>

          <div className="flex flex-wrap gap-2">
            {Object.values(JobCategory).map((category) => (
              <label
                key={category}
                className={
                  form.desiredJobCategories.includes(category)
                    ? 'flex cursor-pointer items-center gap-2 rounded-lg border border-solid border-[#f3ccd7] bg-[#fcebf0] px-3 py-2 text-xs font-semibold text-[#c8385c]'
                    : 'flex cursor-pointer items-center gap-2 rounded-lg border border-solid border-[#dedbe7] bg-white px-3 py-2 text-xs font-semibold text-[#696577]'
                }
              >
                <input
                  type="checkbox"
                  checked={form.desiredJobCategories.includes(category)}
                  onChange={() => {
                    setForm({
                      ...form,
                      desiredJobCategories:
                        form.desiredJobCategories.includes(category)
                          ? form.desiredJobCategories.filter(
                              (item) => item !== category
                            )
                          : [...form.desiredJobCategories, category],
                    });
                  }}
                  className="accent-[#ef476f]"
                />

                {category}
              </label>
            ))}
          </div>
        </fieldset>

        {validationError && (
          <p className="m-0 rounded-lg border border-solid border-[#f2c5ce] bg-[#fff2f4] p-3 text-sm text-[#a43651]">
            {validationError}
          </p>
        )}

        {(isInitialProfile || isDirty) && (
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg border-0 bg-[#ef476f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#df3d65] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save profile'}
          </button>
        )}
      </fieldset>
    </form>
  );
}
