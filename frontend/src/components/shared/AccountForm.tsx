import { useState, type FormEvent } from 'react';

import type { User } from '../../models/users/User';
import type { UpdateUserRequest } from '../../types/users/UpdateUserRequest';

interface AccountFormProps {
  initial: User;
  loading: boolean;

  onSubmit: (
    request: UpdateUserRequest
  ) => Promise<void>;
}

export default function AccountForm({
  initial,
  loading,
  onSubmit,
}: AccountFormProps) {
  const [form, setForm] = useState<UpdateUserRequest>({
    firstName: initial.firstName,
    lastName: initial.lastName,
    email: initial.email,
  });

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset
        disabled={loading}
        className="m-0 grid min-w-0 gap-5 border-0 p-0"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2.5 text-xs font-semibold tracking-wide text-[#625d76]">
            First name

            <input
              required
              minLength={2}
              maxLength={80}
              autoComplete="given-name"
              value={form.firstName}
              onChange={(event) => {
                setForm({ ...form, firstName: event.target.value });
              }}
              className="h-12 w-full min-w-0 rounded-xl border border-solid border-[#e0dce7] bg-[#f8f8fc] px-4 py-3 text-sm font-normal tracking-normal text-[#24233d] outline-none transition-colors placeholder:text-[#918a9d] hover:border-[#cbb9c8] focus:border-[#ef476f] focus:bg-white focus:ring-4 focus:ring-[#ef476f]/10 disabled:opacity-60"
            />
          </label>

          <label className="grid gap-2.5 text-xs font-semibold tracking-wide text-[#625d76]">
            Last name

            <input
              required
              minLength={2}
              maxLength={80}
              autoComplete="family-name"
              value={form.lastName}
              onChange={(event) => {
                setForm({ ...form, lastName: event.target.value });
              }}
              className="h-12 w-full min-w-0 rounded-xl border border-solid border-[#e0dce7] bg-[#f8f8fc] px-4 py-3 text-sm font-normal tracking-normal text-[#24233d] outline-none transition-colors placeholder:text-[#918a9d] hover:border-[#cbb9c8] focus:border-[#ef476f] focus:bg-white focus:ring-4 focus:ring-[#ef476f]/10 disabled:opacity-60"
            />
          </label>
        </div>

        <label className="grid gap-2.5 text-xs font-semibold tracking-wide text-[#625d76]">
          Email

          <input
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            value={form.email}
            onChange={(event) => {
              setForm({ ...form, email: event.target.value });
            }}
            className="h-12 w-full min-w-0 rounded-xl border border-solid border-[#e0dce7] bg-[#f8f8fc] px-4 py-3 text-sm font-normal tracking-normal text-[#24233d] outline-none transition-colors placeholder:text-[#918a9d] hover:border-[#cbb9c8] focus:border-[#ef476f] focus:bg-white focus:ring-4 focus:ring-[#ef476f]/10 disabled:opacity-60"
          />
        </label>

        <button
          type="submit"
          className="mt-1 w-fit max-w-full justify-self-end cursor-pointer rounded-xl border-0 bg-[#ef476f] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#df3d65] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef476f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save details'}
        </button>
      </fieldset>
    </form>
  );
}
