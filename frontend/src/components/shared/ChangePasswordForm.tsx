import { useState, type FormEvent } from 'react';

import type { ChangePasswordRequest } from '../../types/users/ChangePasswordRequest';

interface ChangePasswordFormProps {
  loading: boolean;

  onSubmit: (
    request: ChangePasswordRequest
  ) => Promise<boolean>;
}

export default function ChangePasswordForm({
  loading,
  onSubmit,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmation) {
      setError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('The new password must be different from the current password.');
      return;
    }

    const success = await onSubmit({
      currentPassword,
      newPassword,
    });

    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-solid border-[#f2c5ce] bg-[#fff2f4] p-4 text-sm text-[#a43651]"
        >
          {error}
        </div>
      )}

      <fieldset
        disabled={loading}
        className="m-0 grid min-w-0 gap-5 border-0 p-0"
      >
        <div className="grid items-end gap-5 lg:grid-cols-3">
          <label className="grid min-w-0 gap-2.5 text-xs font-semibold tracking-wide text-[#625d76]">
            Current Password

            <input
              type="password"
              required
              minLength={6}
              maxLength={128}
              autoComplete="current-password"
              placeholder="Unesite trenutnu lozinku"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
              }}
              className="h-12 w-full min-w-0 rounded-xl border border-solid border-[#e0dce7] bg-[#f8f8fc] px-4 py-3 text-sm font-normal tracking-normal text-[#24233d] outline-none transition-colors placeholder:text-[#918a9d] hover:border-[#cbb9c8] focus:border-[#ef476f] focus:bg-white focus:ring-4 focus:ring-[#ef476f]/10 disabled:opacity-60"
            />
          </label>

          <label className="grid min-w-0 gap-2.5 text-xs font-semibold tracking-wide text-[#625d76]">
            New Password

            <input
              type="password"
              required
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
              }}
              className="h-12 w-full min-w-0 rounded-xl border border-solid border-[#e0dce7] bg-[#f8f8fc] px-4 py-3 text-sm font-normal tracking-normal text-[#24233d] outline-none transition-colors placeholder:text-[#918a9d] hover:border-[#cbb9c8] focus:border-[#ef476f] focus:bg-white focus:ring-4 focus:ring-[#ef476f]/10 disabled:opacity-60"
            />
          </label>

          <label className="grid min-w-0 gap-2.5 text-xs font-semibold tracking-wide text-[#625d76]">
            Confirm New Password

            <input
              type="password"
              required
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
              }}
              className="h-12 w-full min-w-0 rounded-xl border border-solid border-[#e0dce7] bg-[#f8f8fc] px-4 py-3 text-sm font-normal tracking-normal text-[#24233d] outline-none transition-colors placeholder:text-[#918a9d] hover:border-[#cbb9c8] focus:border-[#ef476f] focus:bg-white focus:ring-4 focus:ring-[#ef476f]/10 disabled:opacity-60"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-1 w-fit max-w-full justify-self-end cursor-pointer rounded-xl border-0 bg-[#24233d] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#393750] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef476f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Change password'}
        </button>
      </fieldset>
    </form>
  );
}
