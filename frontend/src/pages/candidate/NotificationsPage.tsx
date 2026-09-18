import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { notificationApi } from '../../api_services/notifications/NotificationApiService';

import type { UserNotification } from '../../models/notifications/UserNotification';

import CandidateLayout from '../../components/candidate/CandidateLayout';
import { useRealtimeEvent } from '../../hooks/realtime/useRealtimeEvent';

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<UserNotification[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');

  const handleNotificationCreated = useCallback(
    (notification: UserNotification) => {
      setNotifications((previous) =>
        previous.some((item) => item.id === notification.id)
          ? previous
          : [notification, ...previous]
      );
    },
    []
  );

  useRealtimeEvent<UserNotification>(
    'NotificationCreated',
    handleNotificationCreated
  );

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const data = await notificationApi.getMyNotifications();

        if (active) {
          setNotifications(data);
        }
      } catch {
        if (active) {
          setError('Notifications could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      setSaving(true);
      setActionError('');
      setSuccess('');

      await notificationApi.markNotificationAsRead(id);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );

      window.dispatchEvent(
        new CustomEvent('careerconnect:notification-read')
      );
    } catch {
      setActionError('Notification could not be marked as read.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setSaving(true);
      setActionError('');
      setSuccess('');

      await notificationApi.markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );

      window.dispatchEvent(
        new CustomEvent('careerconnect:notifications-marked-read')
      );

      setSuccess('All notifications have been marked as read.');
    } catch {
      setActionError('Notifications could not be marked as read.');
    } finally {
      setSaving(false);
    }
  };

  const unreadCount =
    notifications.filter((item) => !item.isRead).length;

  return (
    <CandidateLayout>
      <div className="grid min-h-[86vh] content-start gap-7 rounded-[28px] border border-solid border-[#e3dfe8] bg-[#f7f7fb] p-4 shadow-xl sm:p-8">
        <header className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-3xl bg-[#24233d] p-6 sm:p-8">
          <div>
            <h1 className="m-0 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Notifications
            </h1>

            <p className="m-0 mt-3 text-sm leading-relaxed text-[#d3d1e0]">
              Track changes to your application statuses.
            </p>
          </div>

          {!loading && !error && unreadCount > 0 && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                void handleMarkAllAsRead();
              }}
              className="cursor-pointer rounded-lg border border-solid border-[#f0c4d0] bg-[#fff3f6] px-4 py-3 text-sm font-semibold text-[#c8385c] hover:bg-[#fce5ec] disabled:opacity-60"
            >
              Mark all as read
            </button>
          )}
        </header>

        {loading && (
          <p className="m-0 py-10 text-center text-[#858592]">
            Loading notifications...
          </p>
        )}

        {(error || actionError) && (
          <div
            role="alert"
            className="rounded-lg border border-solid border-[#f2c5ce] bg-[#fff2f4] p-4 text-[#a43651]"
          >
            {error || actionError}
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

        {!loading && !error && (
          notifications.length === 0 ? (
            <div className="grid justify-items-center gap-3 py-10 text-center">
              <h2 className="m-0 text-lg font-bold text-[#333344]">
                You have no notifications
              </h2>

              <p className="m-0 text-sm text-[#858592]">
                New notifications will appear here.
              </p>
            </div>
          ) : (
            <>
              <p className="m-0 text-sm text-[#858592]">
                Unread notifications: {unreadCount}
              </p>

              <div className="grid gap-4">
                {[...notifications]
                  .sort(
                    (first, second) =>
                      new Date(second.createdAt).getTime() -
                      new Date(first.createdAt).getTime()
                  )
                  .map((notification) => (
                    <article
                      key={notification.id}
                      className={
                        notification.isRead
                          ? 'grid gap-4 rounded-xl border border-solid border-[#e3dfeb] border-l-4 border-l-[#24233d] bg-white p-5'
                          : 'grid gap-4 rounded-xl border border-solid border-[#e3dfeb] border-l-4 border-l-[#ef476f] bg-[#fff7fa] p-5'
                      }
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="m-0 text-base font-bold text-[#333344]">
                          {notification.isRead
                            ? 'Notification'
                            : 'New notification'}
                        </h3>

                        <span className="text-xs text-[#858592]">
                          {new Date(notification.createdAt)
                            .toLocaleDateString('sr-Latn-RS')}
                        </span>
                      </div>

                      <p className="m-0 text-sm leading-relaxed break-words">
                        {notification.message}
                      </p>

                      {notification.jobListingId && (
                        <Link
                          to={`/my-applications?jobId=${notification.jobListingId}`}
                          className="w-fit rounded-lg bg-[#24233d] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#353451]"
                        >
                          View my application
                        </Link>
                      )}

                      {!notification.isRead && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => {
                            void handleMarkAsRead(notification.id);
                          }}
                          className="w-fit cursor-pointer rounded-lg border border-solid border-[#f0c4d0] bg-[#fff3f6] px-4 py-2 text-sm font-semibold text-[#c8385c] hover:bg-[#fce5ec] disabled:opacity-60"
                        >
                          Mark as read
                        </button>
                      )}
                    </article>
                  ))}
              </div>
            </>
          )
        )}
      </div>
    </CandidateLayout>
  );
}
