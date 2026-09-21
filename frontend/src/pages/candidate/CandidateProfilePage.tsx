import { useEffect, useState } from 'react';

import { candidateApi } from '../../api_services/candidate/CandidateApiService';

import type { CandidateProfile } from '../../models/candidate/CandidateProfile';
import type { UpdateCandidateProfileRequest } from '../../types/candidate/UpdateCandidateProfileRequest';
import type { AddEducationRequest } from '../../types/candidate/AddEducationRequest';
import type { AddWorkExperienceRequest } from '../../types/candidate/AddWorkExperienceRequest';

import CandidateLayout from '../../components/candidate/CandidateLayout';
import CandidateProfileForm from '../../components/candidate/CandidateProfileForm';
import EducationForm from '../../components/candidate/EducationForm';
import WorkExperienceForm from '../../components/candidate/WorkExperienceForm';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

export default function CandidateProfilePage() {
  const [profile, setProfile] =
    useState<CandidateProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSuccess(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [success]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await candidateApi.getCandidateProfile();

        if (active) {
          setProfile(data);
        }
      } catch {
        if (active) {
          setError('Candidate profile could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleSaveProfile = async (
    request: UpdateCandidateProfileRequest
  ) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updated =
        await candidateApi.updateCandidateProfile(request);

      setProfile(updated);
      setSuccess('Profile saved successfully.');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Profile could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = async (
    request: AddEducationRequest
  ): Promise<boolean> => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const education = await candidateApi.addEducation(request);

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              education: [...previous.education, education],
            }
          : previous
      );

      setSuccess('Education added successfully.');
      return true;
    } catch (error) {
      setError(getApiErrorMessage(error, 'Education could not be added.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const deleted = await candidateApi.deleteEducation(id);

      if (!deleted) {
        setError('Education was not found.');
        return;
      }

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              education: previous.education.filter(
                (item) => item.id !== id
              ),
            }
          : previous
      );

      setSuccess('Education removed successfully.');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Education could not be removed.'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async (
    request: AddWorkExperienceRequest
  ): Promise<boolean> => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const experience =
        await candidateApi.addWorkExperience(request);

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              workExperience: [
                ...previous.workExperience,
                experience,
              ],
            }
          : previous
      );

      setSuccess('Work experience added successfully.');
      return true;
    } catch (error) {
      setError(getApiErrorMessage(
        error,
        'Work experience could not be added.'
      ));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const deleted =
        await candidateApi.deleteWorkExperience(id);

      if (!deleted) {
        setError('Work experience was not found.');
        return;
      }

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              workExperience: previous.workExperience.filter(
                (item) => item.id !== id
              ),
            }
          : previous
      );

      setSuccess('Work experience removed successfully.');
    } catch (error) {
      setError(getApiErrorMessage(
        error,
        'Work experience could not be removed.'
      ));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CandidateLayout>
      <div className="grid min-h-[86vh] content-start gap-7 rounded-[28px] border border-solid border-[#e3dfe8] bg-[#f7f7fb] p-4 shadow-xl sm:p-8">
        <header className="relative isolate overflow-hidden rounded-3xl bg-[#24233d] p-6 sm:p-8">
          <h1 className="m-0 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Profile
          </h1>

          <p className="m-0 mt-3 text-sm leading-relaxed text-[#d3d1e0]">
            Showcase your skills, education and experience.
          </p>
        </header>

        {loading && (
          <p className="m-0 py-10 text-center text-[#858592]">
            Loading profile...
          </p>
        )}

        {success && (
          <div
            role="status"
            className="fixed right-5 top-5 z-50 rounded-xl border border-solid border-[#d5ebdd] bg-[#edf8f1] px-5 py-4 text-sm font-semibold text-[#287648] shadow-lg"
          >
            ✓ {success}
          </div>
        )}

        {!loading && profile && (
          <>
            <section className="grid gap-5 rounded-xl border border-solid border-[#d9d9e2] bg-[#fafafd] p-5">
              <h2 className="m-0 border-0 border-l-4 border-solid border-[#ef476f] pl-3 text-lg font-bold text-[#333344]">
                Basic Information
              </h2>

              <CandidateProfileForm
                initial={profile}
                loading={saving}
                onSubmit={handleSaveProfile}
              />
            </section>

            <section className="grid gap-5 rounded-xl border border-solid border-[#d9d9e2] bg-[#fafafd] p-5">
              <h2 className="m-0 border-0 border-l-4 border-solid border-[#ef476f] pl-3 text-lg font-bold text-[#333344]">
                Education
              </h2>

              {profile.education.length === 0 && (
                <p className="m-0 text-sm text-[#858592]">
                  You have not added any education yet.
                </p>
              )}

              {profile.education.map((education) => (
                <article
                  key={education.id}
                  className="grid gap-3 rounded-xl border border-solid border-[#e3dfeb] border-l-4 border-l-[#24233d] bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="m-0 text-base font-bold text-[#333344]">
                        {education.institution}
                      </h3>

                      <p className="m-0 mt-1 text-sm">
                        {education.degree} · {education.fieldOfStudy}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        void handleDeleteEducation(education.id);
                      }}
                      className="cursor-pointer rounded-lg border border-solid border-[#f0c4d0] bg-[#fff3f6] px-4 py-2 text-sm font-semibold text-[#c8385c] hover:bg-[#fce5ec] disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>

                  <p className="m-0 text-xs text-[#858592]">
                    {new Date(education.startDate)
                      .toLocaleDateString('sr-Latn-RS')}
                    {' – '}
                    {new Date(education.endDate)
                      .toLocaleDateString('sr-Latn-RS')}
                  </p>
                </article>
              ))}

              <EducationForm
                loading={saving}
                onSubmit={handleAddEducation}
              />
            </section>

            <section className="grid gap-5 rounded-xl border border-solid border-[#d9d9e2] bg-[#fafafd] p-5">
              <h2 className="m-0 border-0 border-l-4 border-solid border-[#ef476f] pl-3 text-lg font-bold text-[#333344]">
                Work Experience
              </h2>

              {profile.workExperience.length === 0 && (
                <p className="m-0 text-sm text-[#858592]">
                  You have not added any work experience yet.
                </p>
              )}

              {profile.workExperience.map((experience) => (
                <article
                  key={experience.id}
                  className="grid gap-3 rounded-xl border border-solid border-[#e3dfeb] border-l-4 border-l-[#24233d] bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="m-0 text-base font-bold text-[#333344]">
                        {experience.position}
                      </h3>

                      <p className="m-0 mt-1 text-sm">
                        {experience.company}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        void handleDeleteExperience(experience.id);
                      }}
                      className="cursor-pointer rounded-lg border border-solid border-[#f0c4d0] bg-[#fff3f6] px-4 py-2 text-sm font-semibold text-[#c8385c] hover:bg-[#fce5ec] disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>

                  <p className="m-0 text-xs text-[#858592]">
                    {new Date(experience.startDate)
                      .toLocaleDateString('sr-Latn-RS')}
                    {' – '}
                    {experience.endDate
                      ? new Date(experience.endDate)
                          .toLocaleDateString('sr-Latn-RS')
                      : 'Current'}
                  </p>

                  <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#5e5d6c]">
                    {experience.description}
                  </p>
                </article>
              ))}

              <WorkExperienceForm
                loading={saving}
                onSubmit={handleAddExperience}
              />
            </section>
          </>
        )}
      </div>
    </CandidateLayout>
  );
}
