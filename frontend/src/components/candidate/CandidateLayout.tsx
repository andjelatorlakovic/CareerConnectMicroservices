import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/auth/useAuth';
import { notificationApi } from '../../api_services/notifications/NotificationApiService';
import { useRealtimeEvent } from '../../hooks/realtime/useRealtimeEvent';

import type { UserNotification } from '../../models/notifications/UserNotification';

interface CandidateLayoutProps {
  children: ReactNode;
}

export default function CandidateLayout({
  children,
}: CandidateLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }

    let active = true;

    void notificationApi.getMyNotifications()
      .then((notifications) => {
        if (active) {
          setUnreadNotifications(
            notifications.filter((notification) => !notification.isRead)
              .length
          );
        }
      })
      .catch(() => {
        if (active) setUnreadNotifications(0);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleNotificationCreated = useCallback(
    (_notification: UserNotification) => {
      setUnreadNotifications((previous) => previous + 1);
    },
    []
  );

  const handleNotificationRead = useCallback(() => {
    setUnreadNotifications((previous) => Math.max(0, previous - 1));
  }, []);

  const handleNotificationsMarkedRead = useCallback(() => {
    setUnreadNotifications(0);
  }, []);

  useEffect(() => {
    const markOneAsRead = () => {
      setUnreadNotifications((previous) => Math.max(0, previous - 1));
    };

    const markAllAsRead = () => {
      setUnreadNotifications(0);
    };

    window.addEventListener(
      'careerconnect:notification-read',
      markOneAsRead
    );
    window.addEventListener(
      'careerconnect:notifications-marked-read',
      markAllAsRead
    );

    return () => {
      window.removeEventListener(
        'careerconnect:notification-read',
        markOneAsRead
      );
      window.removeEventListener(
        'careerconnect:notifications-marked-read',
        markAllAsRead
      );
    };
  }, []);

  useRealtimeEvent<UserNotification>(
    'NotificationCreated',
    handleNotificationCreated
  );
  useRealtimeEvent<string>('NotificationRead', handleNotificationRead);
  useRealtimeEvent<void>(
    'NotificationsMarkedRead',
    handleNotificationsMarkedRead
  );

  const userLetter =
    user?.email?.charAt(0).toUpperCase() || 'K';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-[#19182d] text-left font-sans text-sm leading-normal text-[#333344] [color-scheme:light] [&_*]:box-border [&_button]:font-sans [&_input]:font-sans [&_select]:font-sans [&_textarea]:font-sans">
      <header className="flex flex-col items-center justify-between gap-5 border-0 border-b border-solid border-[#d9d9e2] bg-white px-6 py-5 lg:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/jobs"
            className="text-3xl font-extrabold tracking-tight whitespace-nowrap text-[#ef476f] no-underline hover:text-[#d9365f]"
          >
            CareerConnect
          </Link>
          <span className="rounded-md bg-[#24233d] px-2 py-1 text-[10px] font-bold tracking-wider text-white">
            CANDIDATE
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-semibold">
          <NavLink
            to="/jobs"
            className="border-0 border-b-2 border-solid border-transparent py-2 text-[#333344] no-underline hover:text-[#ef476f] [&.active]:border-[#ef476f] [&.active]:text-[#ef476f]"
          >
            Jobs
          </NavLink>

          <NavLink
            to="/matching-jobs"
            className="border-0 border-b-2 border-solid border-transparent py-2 text-[#333344] no-underline hover:text-[#ef476f] [&.active]:border-[#ef476f] [&.active]:text-[#ef476f]"
          >
            For you
          </NavLink>

          <NavLink
            to="/my-applications"
            className="border-0 border-b-2 border-solid border-transparent py-2 text-[#333344] no-underline hover:text-[#ef476f] [&.active]:border-[#ef476f] [&.active]:text-[#ef476f]"
          >
            My applications
          </NavLink>

          <NavLink
            to="/candidate-profile"
            className="border-0 border-b-2 border-solid border-transparent py-2 text-[#333344] no-underline hover:text-[#ef476f] [&.active]:border-[#ef476f] [&.active]:text-[#ef476f]"
          >
            My profile
          </NavLink>

          <NavLink
            to="/notifications"
            className="inline-flex items-center gap-2 border-0 border-b-2 border-solid border-transparent py-2 text-[#333344] no-underline hover:text-[#ef476f] [&.active]:border-[#ef476f] [&.active]:text-[#ef476f]"
          >
            Notifications
            {unreadNotifications > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-[#ef476f] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/account"
            className="border-0 border-b-2 border-solid border-transparent py-2 text-[#333344] no-underline hover:text-[#ef476f] [&.active]:border-[#ef476f] [&.active]:text-[#ef476f]"
          >
            My account
          </NavLink>

          <div
            className="relative"
            onBlur={(event) => {
              if (
                !event.currentTarget.contains(event.relatedTarget)
              ) {
                setProfileOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setProfileOpen(false);
              }
            }}
          >
            <button
              type="button"
              aria-label="Open account menu"
              aria-expanded={profileOpen}
              onClick={() => {
                setProfileOpen((previous) => !previous);
              }}
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
                    <span className="text-xs text-[#92919e]">
                      Signed in as
                    </span>

                    <strong className="text-sm break-all">
                      {user?.email}
                    </strong>
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

      <main className="w-full p-3 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
