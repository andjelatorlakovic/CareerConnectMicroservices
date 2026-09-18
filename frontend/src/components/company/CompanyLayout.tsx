import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/auth/useAuth';

interface CompanyLayoutProps {
  children: ReactNode;
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const userLetter = user?.email?.charAt(0).toUpperCase() || 'K';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-[#19182d] text-left font-sans text-sm leading-normal text-[#333344] [color-scheme:light] [&_*]:box-border [&_button]:font-sans [&_input]:font-sans [&_select]:font-sans [&_textarea]:font-sans">
      <header className="flex flex-col items-center justify-between gap-5 border-0 border-b border-solid border-[#d9d9e2] bg-white px-6 py-5 lg:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/my-jobs" className="text-3xl font-extrabold tracking-tight whitespace-nowrap text-[#ef476f] no-underline hover:text-[#d9365f]">
            CareerConnect
          </Link>
          <span className="rounded-md bg-[#24233d] px-2 py-1 text-[10px] font-bold tracking-wider text-white">
            COMPANY
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-semibold">
          <NavLink to="/my-jobs" className="border-0 border-b-2 border-solid border-transparent py-2 text-[#333344] no-underline hover:text-[#ef476f] [&.active]:border-[#ef476f] [&.active]:text-[#ef476f]">
            My jobs
          </NavLink>
          <NavLink to="/company-profile" className="border-0 border-b-2 border-solid border-transparent py-2 text-[#333344] no-underline hover:text-[#ef476f] [&.active]:border-[#ef476f] [&.active]:text-[#ef476f]">
            Company profile
          </NavLink>
          <NavLink to="/account" className="border-0 border-b-2 border-solid border-transparent py-2 text-[#333344] no-underline hover:text-[#ef476f] [&.active]:border-[#ef476f] [&.active]:text-[#ef476f]">
            My account
          </NavLink>

          <div
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setProfileOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setProfileOpen(false);
            }}
          >
            <button
              type="button"
              aria-label="Open account menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((previous) => !previous)}
              className="grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-[#24233d] text-sm font-extrabold text-white transition hover:bg-[#ef476f]"
            >
              {userLetter}
            </button>

            {profileOpen && (
              <div className="absolute top-full right-0 z-50 mt-3 grid w-72 max-w-[85vw] gap-4 rounded-xl border border-solid border-[#dedde8] bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#fce8ee] font-bold text-[#c8385c]">
                    {userLetter}
                  </div>
                  <div className="grid min-w-0 gap-1">
                    <span className="text-xs text-[#92919e]">Signed in as</span>
                    <strong className="text-sm break-all">{user?.email}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="cursor-pointer rounded-lg border border-solid border-[#f0c4d0] bg-[#fff3f6] px-4 py-3 text-sm font-semibold text-[#c8385c] transition hover:bg-[#fce5ec]"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="w-full p-3 sm:p-6 lg:p-8 [&_.applications-page]:!min-h-0 [&_.applications-page]:!bg-transparent [&_.applications-page]:!p-0 [&_.company-profile-page]:!min-h-0 [&_.company-profile-page]:!bg-transparent [&_.company-profile-page]:!p-0 [&_.details-page]:!min-h-0 [&_.details-page]:!bg-transparent [&_.details-page]:!p-0 [&_.job-page]:!min-h-0 [&_.job-page]:!bg-transparent [&_.job-page]:!p-0 [&_.jobs-page]:!min-h-0 [&_.jobs-page]:!bg-transparent [&_.jobs-page]:!p-0 [&_.question-page]:!min-h-0 [&_.question-page]:!bg-transparent [&_.question-page]:!p-0 [&_.questions-page]:!min-h-0 [&_.questions-page]:!bg-transparent [&_.questions-page]:!p-0 [&_.applications-container]:!min-h-[86vh] [&_.applications-container]:!w-full [&_.applications-container]:!rounded-[28px] [&_.applications-container]:!border [&_.applications-container]:!border-solid [&_.applications-container]:!border-[#e3dfe8] [&_.applications-container]:!bg-[#f7f7fb] [&_.applications-container]:!p-4 [&_.applications-container]:!shadow-xl sm:[&_.applications-container]:!p-8 [&_.company-profile-card]:!min-h-[86vh] [&_.company-profile-card]:!w-full [&_.company-profile-card]:!rounded-[28px] [&_.company-profile-card]:!border [&_.company-profile-card]:!border-solid [&_.company-profile-card]:!border-[#e3dfe8] [&_.company-profile-card]:!bg-[#f7f7fb] [&_.company-profile-card]:!p-4 [&_.company-profile-card]:!shadow-xl sm:[&_.company-profile-card]:!p-8 [&_.details-container]:!min-h-[86vh] [&_.details-container]:!w-full [&_.details-container]:!rounded-[28px] [&_.details-container]:!border [&_.details-container]:!border-solid [&_.details-container]:!border-[#e3dfe8] [&_.details-container]:!bg-[#f7f7fb] [&_.details-container]:!p-4 [&_.details-container]:!shadow-xl sm:[&_.details-container]:!p-8 [&_.job-card]:!min-h-[86vh] [&_.job-card]:!w-full [&_.job-card]:!rounded-[28px] [&_.job-card]:!border [&_.job-card]:!border-solid [&_.job-card]:!border-[#e3dfe8] [&_.job-card]:!bg-[#f7f7fb] [&_.job-card]:!p-4 [&_.job-card]:!shadow-xl sm:[&_.job-card]:!p-8 [&_.jobs-container]:!min-h-[86vh] [&_.jobs-container]:!w-full [&_.jobs-container]:!rounded-[28px] [&_.jobs-container]:!border [&_.jobs-container]:!border-solid [&_.jobs-container]:!border-[#e3dfe8] [&_.jobs-container]:!bg-[#f7f7fb] [&_.jobs-container]:!p-4 [&_.jobs-container]:!shadow-xl sm:[&_.jobs-container]:!p-8 [&_.question-card]:!min-h-0 [&_.question-card]:!w-full [&_.question-card]:!rounded-[28px] [&_.question-card]:!border [&_.question-card]:!border-solid [&_.question-card]:!border-[#e3dfe8] [&_.question-card]:!bg-[#f7f7fb] [&_.question-card]:!p-4 [&_.question-card]:!shadow-xl sm:[&_.question-card]:!p-8 [&_.questions-content]:!min-h-[86vh] [&_.questions-content]:!w-full [&_.questions-content]:!rounded-[28px] [&_.questions-content]:!border [&_.questions-content]:!border-solid [&_.questions-content]:!border-[#e3dfe8] [&_.questions-content]:!bg-[#f7f7fb] [&_.questions-content]:!p-4 [&_.questions-content]:!shadow-xl sm:[&_.questions-content]:!p-8 [&_.applications-header]:!rounded-3xl [&_.applications-header]:!bg-[#24233d] [&_.applications-header]:!p-6 sm:[&_.applications-header]:!p-8 [&_.company-profile-header]:!rounded-3xl [&_.company-profile-header]:!border-0 [&_.company-profile-header]:!bg-[#24233d] [&_.company-profile-header]:!p-6 sm:[&_.company-profile-header]:!p-8 [&_.details-container_.job-header]:!rounded-3xl [&_.details-container_.job-header]:!bg-[#24233d] [&_.details-container_.job-header]:!p-6 sm:[&_.details-container_.job-header]:!p-8 [&_.job-header]:!rounded-3xl [&_.job-header]:!border-0 [&_.job-header]:!bg-[#24233d] [&_.job-header]:!p-6 sm:[&_.job-header]:!p-8 [&_.jobs-header]:!rounded-3xl [&_.jobs-header]:!bg-[#24233d] [&_.jobs-header]:!p-6 sm:[&_.jobs-header]:!p-8 [&_.question-header]:!rounded-3xl [&_.question-header]:!border-0 [&_.question-header]:!bg-[#24233d] [&_.question-header]:!p-6 sm:[&_.question-header]:!p-8 [&_.applications-header_h1]:!text-white [&_.applications-header_p]:!text-[#d3d1e0] [&_.company-profile-header_h1]:!text-white [&_.company-profile-header_p]:!text-[#d3d1e0] [&_.details-container_.job-header_h1]:!text-white [&_.details-container_.job-header_p]:!text-[#d3d1e0] [&_.job-header_h1]:!text-white [&_.job-header_p]:!text-[#d3d1e0] [&_.jobs-header_h1]:!text-white [&_.jobs-header_p]:!text-[#d3d1e0] [&_.question-header_h1]:!text-white [&_.question-header_p]:!text-[#d3d1e0] [&_.stats-grid]:!grid [&_.stats-grid]:!grid-cols-1 [&_.stats-grid]:!gap-4 sm:[&_.stats-grid]:!grid-cols-2 lg:[&_.stats-grid]:!grid-cols-3 [&_.stat-card]:!rounded-2xl [&_.stat-card]:!border [&_.stat-card]:!border-solid [&_.stat-card]:!border-[#e6e2eb] [&_.stat-card]:!bg-white [&_.stat-card]:!p-5 [&_.stat-card]:!shadow-sm [&_.list-header]:!mt-8 [&_.list-header]:!rounded-2xl [&_.list-header]:!border [&_.list-header]:!border-solid [&_.list-header]:!border-[#e6e2eb] [&_.list-header]:!bg-white [&_.list-header]:!p-5 [&_.jobs-list]:!grid [&_.jobs-list]:!gap-4 [&_.applications-list]:!grid [&_.applications-list]:!gap-4 [&_.job-item]:!rounded-2xl [&_.job-item]:!border [&_.job-item]:!border-solid [&_.job-item]:!border-[#e6e2eb] [&_.job-item]:!bg-white [&_.job-item]:!p-5 [&_.job-item]:!shadow-sm [&_.application-item]:!rounded-2xl [&_.application-item]:!border [&_.application-item]:!border-solid [&_.application-item]:!border-[#e6e2eb] [&_.application-item]:!bg-white [&_.application-item]:!p-5 [&_.application-item]:!shadow-sm [&_.content-section]:!rounded-2xl [&_.content-section]:!border [&_.content-section]:!border-solid [&_.content-section]:!border-[#e6e2eb] [&_.content-section]:!bg-white [&_.content-section]:!p-5 [&_.description-card]:!rounded-xl [&_.description-card]:!bg-[#f8f8fc] [&_.info-card]:!rounded-xl [&_.info-card]:!border [&_.info-card]:!border-solid [&_.info-card]:!border-[#e6e2eb] [&_.info-card]:!bg-white [&_.management-panel]:!rounded-2xl [&_.management-panel]:!border [&_.management-panel]:!border-solid [&_.management-panel]:!border-[#e6e2eb] [&_.management-panel]:!bg-white [&_.management-panel]:!p-5 [&_.answers-container]:!rounded-2xl [&_.answers-container]:!border [&_.answers-container]:!border-solid [&_.answers-container]:!border-[#f1c8d3] [&_.answers-container]:!bg-[#fff7f9] [&_.answers-container]:!p-5 [&_.add-job-button]:!rounded-xl [&_.add-job-button]:!border-0 [&_.add-job-button]:!bg-[#ef476f] [&_.add-job-button]:!px-5 [&_.add-job-button]:!py-3 [&_.add-job-button]:!font-bold [&_.add-job-button]:!text-white hover:[&_.add-job-button]:!bg-[#d9365f] [&_.management-button]:!rounded-xl [&_.management-button]:!border-0 [&_.management-button]:!bg-[#ef476f] [&_.management-button]:!px-4 [&_.management-button]:!py-3 [&_.management-button]:!font-semibold [&_.management-button]:!text-white hover:[&_.management-button]:!bg-[#d9365f] [&_.answers-button]:!rounded-xl [&_.answers-button]:!border [&_.answers-button]:!border-solid [&_.answers-button]:!border-[#ef476f] [&_.answers-button]:!bg-white [&_.answers-button]:!px-4 [&_.answers-button]:!py-3 [&_.answers-button]:!font-semibold [&_.answers-button]:!text-[#d9365f] hover:[&_.answers-button]:!bg-[#fff1f4] [&_input]:!rounded-xl [&_input]:!border-[#e2dfe9] [&_input]:!bg-[#f8f8fc] [&_input]:!px-4 [&_input]:!py-3 [&_input]:focus:!border-[#ef476f] [&_input]:focus:!ring-4 [&_input]:focus:!ring-[#ef476f]/10 [&_select]:!rounded-xl [&_select]:!border-[#e2dfe9] [&_select]:!bg-[#f8f8fc] [&_select]:!px-4 [&_select]:!py-3 [&_select]:focus:!border-[#ef476f] [&_select]:focus:!ring-4 [&_select]:focus:!ring-[#ef476f]/10 [&_textarea]:!rounded-xl [&_textarea]:!border-[#e2dfe9] [&_textarea]:!bg-[#f8f8fc] [&_textarea]:!px-4 [&_textarea]:!py-3 [&_textarea]:focus:!border-[#ef476f] [&_textarea]:focus:!ring-4 [&_textarea]:focus:!ring-[#ef476f]/10">
        {children}
      </main>
    </div>
  );
}
