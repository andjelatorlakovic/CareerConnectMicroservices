import { useEffect, useState } from 'react';

import { userApi } from '../../api_services/users/UserApiService';
import { useAuth } from '../../hooks/auth/useAuth';
import { Role } from '../../models/auth/Role';

import type { User } from '../../models/users/User';
import type { UpdateUserRequest } from '../../types/users/UpdateUserRequest';
import type { ChangePasswordRequest } from '../../types/users/ChangePasswordRequest';

import CandidateLayout from '../../components/candidate/CandidateLayout';
import CompanyLayout from '../../components/company/CompanyLayout';
import AdminLayout from '../../components/admin/AdminLayout';


import AccountForm from '../../components/shared/AccountForm';
import ChangePasswordForm from '../../components/shared/ChangePasswordForm';

export default function AccountPage() {
  const { user: authUser, login } = useAuth();

  const [account, setAccount] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const data = await userApi.getMe();

        if (active) {
          setAccount(data);
        }
      } catch {
        if (active) {
          setError('Account details could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, []);

  const handleSaveAccount = async (
    request: UpdateUserRequest
  ): Promise<void> => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updated = await userApi.updateMe(request);

      setAccount(updated);

      if (authUser) {
        login({
          token: authUser.token,
          email: updated.email,
          role: updated.role,
        });
      }

      setSuccess('Account details saved successfully.');
    } catch {
      setError('Account details could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (
    request: ChangePasswordRequest
  ): Promise<boolean> => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await userApi.changePassword(request);

      setSuccess('Password changed successfully.');

      return true;
    } catch {
      setError(
        'Lozinka nije promenjena. Proverite trenutnu lozinku.'
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const Layout =
      authUser?.role===Role.Admin
      ? AdminLayout
      : authUser?.role === Role.Company
        ? CompanyLayout
        : CandidateLayout;

  return ( 
    <Layout>
      <div
        className={
          authUser?.role === Role.Company
            ? 'p-3 sm:p-6 lg:p-8'
            : ''
        }
      >
        <div className="grid min-h-[86vh] content-start gap-6 rounded-[28px] border border-solid border-[#dedde8] bg-[#f7f7fb] p-5 text-left font-sans text-sm leading-normal text-[#333344] shadow-xl [color-scheme:light] [&_*]:box-border [&_button]:font-sans [&_input]:font-sans sm:p-8">
          <header className="relative isolate overflow-hidden rounded-3xl bg-[#24233d] p-6 sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-12 -z-10 size-64 rounded-full border-[40px] border-solid border-[#ef476f]/15" />
            <span className="mb-4 inline-block text-xs font-semibold tracking-[0.16em] text-[#ffb4c8] uppercase">Personal account</span>
            <h1 className="m-0 text-3xl font-bold tracking-tight text-white sm:text-4xl">Moj nalog</h1>
            <p className="m-0 mt-3 text-sm leading-relaxed text-[#d3d1e0]">Your details and settings in one place.</p>
          </header>

          {loading && (
            <p className="m-0 py-10 text-center text-[#858592]">
              Loading account...
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

          {success && (
            <div
              role="status"
              className="rounded-lg border border-solid border-[#d5ebdd] bg-[#edf8f1] p-4 text-[#287648]"
            >
              {success}
            </div>
          )}

          {!loading && account && (
            <>
              <section className="overflow-hidden rounded-3xl border border-solid border-[#e5e3ec] bg-white shadow-[0_6px_24px_-14px_rgba(36,35,61,0.25)]">
                <div className="flex flex-wrap items-center gap-4 border-0 border-b border-solid border-[#f0edf3] p-6">
                  <div aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#24233d] text-xl font-bold text-[#ffd5e0]">
                    {`${account.firstName.charAt(0)}${account.lastName.charAt(0)}`.toUpperCase() || account.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-xl font-bold break-words text-[#24233d]">{`${account.firstName} ${account.lastName}`.trim() || account.email}</h2>
                    <p className="m-0 mt-1 text-sm break-all text-[#777586]">{account.email}</p>
                  </div>
                  <span className="rounded-full border border-solid border-[#f4ccd7] bg-[#ffe8ef] px-4 py-2 text-xs font-semibold text-[#a83053]">
                    {account.role === Role.Admin ? 'Administrator' : account.role === Role.Company ? 'Company' : 'Candidate'}
                  </span>
                </div>
                <dl className="m-0 grid gap-6 p-6 sm:grid-cols-2">
                  <div><dt className="text-xs font-semibold text-[#777586]">Name</dt><dd className="m-0 mt-2 text-base font-semibold text-[#24233d]">{account.firstName || '—'}</dd></div>
                  <div><dt className="text-xs font-semibold text-[#777586]">Last Name</dt><dd className="m-0 mt-2 text-base font-semibold text-[#24233d]">{account.lastName || '—'}</dd></div>
                  <div><dt className="text-xs font-semibold text-[#777586]">Email Address</dt><dd className="m-0 mt-2 text-base font-semibold break-all text-[#24233d]">{account.email}</dd></div>
                  <div><dt className="text-xs font-semibold text-[#777586]">Registration Date</dt><dd className="m-0 mt-2 text-base font-semibold text-[#24233d]">{new Date(account.createdAt).toLocaleDateString('sr-Latn-RS')}</dd></div>
                </dl>
              </section>

              <section className="overflow-hidden rounded-3xl border border-solid border-[#eadce3] bg-white shadow-sm">
                <button
                  type="button"
                  aria-expanded={settingsOpen}
                  aria-controls="account-settings"
                  disabled={saving}
                  onClick={() => setSettingsOpen((previous) => !previous)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-[#fff0f5] p-6 text-left transition-colors hover:bg-[#ffe5ee] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#ef476f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    <span className="block text-base font-bold text-[#a83053]">Account settings</span>
                    <span className="mt-1 block text-sm text-[#77616d]">Update your personal details or change your password.</span>
                  </span>
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={settingsOpen ? 'shrink-0 rotate-180 text-[#a83053]' : 'shrink-0 text-[#a83053]'}><path d="m6 9 6 6 6-6" /></svg>
                </button>
                <div id="account-settings" hidden={!settingsOpen}>
                  {settingsOpen && (
                    <div className="grid gap-5 bg-[#f7f7fb] p-4 sm:p-6">
                      <section className="grid gap-6 rounded-2xl border border-solid border-[#e7e2eb] bg-white p-5 shadow-[0_4px_16px_-10px_rgba(36,35,61,0.18)] sm:p-6">
                        <div className="flex items-start gap-3 border-0 border-b border-solid border-[#f0eaf0] pb-5">
                          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0f5] text-[#b73359]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg>
                          </span>
                          <div><h2 className="m-0 text-base font-bold text-[#24233d]">Personal details</h2><p className="m-0 mt-1 text-xs leading-relaxed text-[#777586]">Update your account first name, last name and email address.</p></div>
                        </div>
                        <AccountForm initial={account} loading={saving} onSubmit={handleSaveAccount} />
                      </section>
                      <section className="grid gap-6 rounded-2xl border border-solid border-[#e7e2eb] bg-white p-5 shadow-[0_4px_16px_-10px_rgba(36,35,61,0.18)] sm:p-6">
                        <div className="flex items-start gap-3 border-0 border-b border-solid border-[#f0eaf0] pb-5">
                          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#24233d] text-[#ffd5e0]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" /></svg>
                          </span>
                          <div><h2 className="m-0 text-base font-bold text-[#24233d]">Promena lozinke</h2><p className="m-0 mt-1 text-xs leading-relaxed text-[#777586]">Unesite trenutnu lozinku, zatim novu lozinku i njenu potvrdu.</p></div>
                        </div>
                        <ChangePasswordForm loading={saving} onSubmit={handleChangePassword} />
                      </section>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
