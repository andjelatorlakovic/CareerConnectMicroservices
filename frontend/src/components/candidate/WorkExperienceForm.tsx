import { useState, type FormEvent } from 'react';

import type { AddWorkExperienceRequest } from '../../types/candidate/AddWorkExperienceRequest';

interface WorkExperienceFormProps {
  loading: boolean;

  onSubmit: (
    request: AddWorkExperienceRequest
  ) => Promise<boolean>;
}

const initialForm = {
  company: '',
  position: '',
  description: '',
  startDate: '',
  endDate: '',
};

const today = new Date().toISOString().slice(0, 10);

export default function WorkExperienceForm({
  loading,
  onSubmit,
}: WorkExperienceFormProps) {
  const [form, setForm] = useState(initialForm);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const success = await onSubmit({
      company: form.company.trim(),
      position: form.position.trim(),
      description: form.description.trim(),
      startDate: `${form.startDate}T00:00:00`,
      endDate: form.endDate
        ? `${form.endDate}T00:00:00`
        : null,
    });

    if (success) {
      setForm(initialForm);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-0 border-t border-solid border-[#e5e2ec] pt-5"
    >
      <h3 className="m-0 mb-4 text-base font-bold text-[#333344]">
        Add work experience
      </h3>

      <fieldset
        disabled={loading}
        className="m-0 grid min-w-0 gap-5 border-0 p-0"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Company

            <input
              required
              value={form.company}
              onChange={(event) => {
                setForm({ ...form, company: event.target.value });
              }}
              className="w-full rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
              minLength={2}
              maxLength={150}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Position

            <input
              required
              value={form.position}
              onChange={(event) => {
                setForm({ ...form, position: event.target.value });
              }}
              className="w-full rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
              minLength={2}
              maxLength={150}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Start date

            <input
              type="date"
              required
              value={form.startDate}
              max={form.endDate || today}
              onChange={(event) => {
                setForm({ ...form, startDate: event.target.value });
              }}
              className="w-full rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            End date

            <input
              type="date"
              value={form.endDate}
              min={form.startDate || undefined}
              max={today}
              onChange={(event) => {
                setForm({ ...form, endDate: event.target.value });
              }}
              className="w-full rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
            />

            <small className="text-xs font-normal text-[#8c8c9a]">
              Leave empty if you still work here.
            </small>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold">
          Job description

          <textarea
            value={form.description}
            onChange={(event) => {
              setForm({ ...form, description: event.target.value });
            }}
            className="min-h-32 w-full resize-y rounded-lg border border-solid border-[#d9d9e2] bg-white px-3 py-3 text-sm outline-none focus:border-[#ef476f] focus:ring-2 focus:ring-[#ef476f]/15"
            maxLength={2000}
          />
        </label>

        <button
          type="submit"
          className="w-fit cursor-pointer rounded-lg border-0 bg-[#ef476f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#df3d65] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving...' : '+ Add experience'}
        </button>
      </fieldset>
    </form>
  );
}
