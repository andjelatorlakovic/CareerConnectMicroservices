export interface UserNotification {
  id: string;
  jobListingId: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}
