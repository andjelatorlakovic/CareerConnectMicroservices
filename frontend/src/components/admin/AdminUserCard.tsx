import { Link } from 'react-router-dom';

import type { User } from '../../models/users/User';
import { Role } from '../../models/auth/Role';

interface AdminUserCardProps {
  user: User;
  currentUserId: string;
  disabled: boolean;
  updating: boolean;
  onToggleStatus: (user: User) => Promise<void>;
}

export default function AdminUserCard({
  user,
  currentUserId,
  disabled,
  updating,
  onToggleStatus,
}: AdminUserCardProps) {
  const isCompany = user.role === Role.Company;
  const isCurrentUser = user.id === currentUserId;

  const fullName =
    `${user.firstName} ${user.lastName}`.trim() || user.email;

  const initials =
    `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
      .toUpperCase() || user.email.charAt(0).toUpperCase();

  return (
    <article className="relative overflow-hidden rounded-[22px] border border-solid border-[#e5e3ec] bg-white text-left shadow-[0_3px_12px_-6px_rgba(36,35,61,0.12)] transition-[border-color,box-shadow] duration-200 hover:border-[#e8b6c5] hover:shadow-[0_8px_24px_-10px_rgba(36,35,61,0.2)]">
      <div aria-hidden="true" className={isCompany ? 'absolute top-5 bottom-5 left-0 w-1 rounded-r-full bg-[#ef476f]' : 'absolute top-5 bottom-5 left-0 w-1 rounded-r-full bg-[#24233d]/20'} />
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-center gap-4">
          <div
            aria-hidden="true"
            className={
              isCompany
                ? 'grid size-14 shrink-0 place-items-center rounded-2xl border border-solid border-[#f4ced9] bg-[#fff0f5] text-lg font-bold tracking-wide text-[#b73359] shadow-sm'
                : 'grid size-14 shrink-0 place-items-center rounded-2xl border border-solid border-[#24233d] bg-[#24233d] text-lg font-bold tracking-wide text-[#ffd5e0] shadow-sm'
            }
          >
            {initials}
          </div>

          <div className="min-w-0">
            {isCompany ? (
              <Link
                to={`/admin/companies/${user.id}/jobs`}
                className="rounded text-lg font-bold break-words text-[#29283e] no-underline transition-colors hover:text-[#ef476f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ef476f]"
              >
                {fullName}
              </Link>
            ) : (
              <h3 className="m-0 text-lg font-bold break-words text-[#29283e]">
                {fullName}
              </h3>
            )}

            <p className="m-0 mt-1.5 text-sm break-all text-[#777586]">
              {user.email}
            </p>

            {isCurrentUser && (
              <span className="mt-2 inline-block text-xs font-semibold text-[#a13b60]">
                Your account
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <span className="inline-flex items-center rounded-full border border-solid border-[#e6e4ed] bg-[#f5f4f8] px-3 py-1.5 text-xs font-semibold text-[#24233d]">
            {isCompany
              ? 'Company'
              : user.role === Role.Candidate
                ? 'Candidate'
                : 'Admin'}
          </span>

          <span
            className={
              user.isActive
                ? 'inline-flex items-center gap-2 rounded-full border border-solid border-[#d9ecdf] bg-[#eef8f1] px-3 py-1.5 text-xs font-semibold text-[#327449]'
                : 'inline-flex items-center gap-2 rounded-full border border-solid border-[#eedce2] bg-[#fcf1f4] px-3 py-1.5 text-xs font-semibold text-[#a34962]'
            }
          >
            <span
              aria-hidden="true"
              className={
                user.isActive
                  ? 'size-1.5 rounded-full bg-[#429a62]'
                  : 'size-1.5 rounded-full bg-[#c06b83]'
              }
            />

            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-0 border-t border-solid border-[#f0edf3] bg-[#fcfafc] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex shrink-0 items-center gap-2 text-xs text-[#858292]">
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M16 3v4M8 3v4M3 11h18" />
          </svg>

          <span>
            Registered{' '}
            <time
              dateTime={user.createdAt}
              className="font-medium text-[#625f73]"
            >
              {new Date(user.createdAt).toLocaleDateString(
                'sr-Latn-RS'
              )}
            </time>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
          <button
            type="button"
            disabled={disabled || updating || isCurrentUser}
            aria-label={
              isCurrentUser
                ? 'You cannot deactivate your own account'
                : `${user.isActive ? 'Deactivate' : 'Activate'} account: ${fullName}`
            }
            onClick={() => {
              void onToggleStatus(user);
            }}
            className={
              user.isActive
                ? 'inline-flex min-h-10 items-center justify-center rounded-xl border border-solid border-[#ebd4dc] bg-white px-4 py-2 text-xs font-semibold text-[#b34463] transition-colors hover:border-[#dfafbf] hover:bg-[#fff2f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef476f] disabled:cursor-not-allowed disabled:opacity-45 enabled:cursor-pointer'
                : 'inline-flex min-h-10 items-center justify-center rounded-xl border border-solid border-[#cfe3d5] bg-[#eef8f1] px-4 py-2 text-xs font-semibold text-[#327449] transition-colors hover:border-[#aacfb6] hover:bg-[#e1f2e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#327449] disabled:cursor-not-allowed disabled:opacity-45 enabled:cursor-pointer'
            }
          >
            {updating
              ? 'Saving...'
              : isCurrentUser
                ? 'Your account'
                : user.isActive
                  ? 'Deactivate'
                  : 'Activate'}
          </button>

          {isCompany && (
            <Link
              to={`/admin/companies/${user.id}/jobs`}
              className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-solid border-[#24233d] bg-[#24233d] px-4 py-2 text-xs font-semibold text-white no-underline transition-colors hover:border-[#393750] hover:bg-[#393750] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef476f]"
            >
              View Jobs

              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
