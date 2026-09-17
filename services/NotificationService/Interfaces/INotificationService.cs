using NotificationService.DTOs;

namespace NotificationService.Interfaces;

public interface INotificationService
{
    Task<NotificationDto> CreateAsync(CreateNotificationRequest request);
    Task<List<NotificationDto>> GetMyNotificationsAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Guid userId, Guid notificationId);
    Task MarkAllAsReadAsync(Guid userId);
}
