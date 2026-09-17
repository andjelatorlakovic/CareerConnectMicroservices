using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using NotificationService.Data;
using NotificationService.DTOs;
using NotificationService.Hubs;
using NotificationService.Interfaces;
using NotificationService.Models;

namespace NotificationService.Services;

public class NotificationService : INotificationService
{
    private readonly NotificationDbContext _context;
    private readonly IHubContext<RealtimeHub> _hubContext;

    public NotificationService(
        NotificationDbContext context,
        IHubContext<RealtimeHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }   
    
    public async Task<NotificationDto> CreateAsync(
        CreateNotificationRequest request)
    {
        var notification = new Notification
        {
            UserId = request.UserId,
            Message = request.Message.Trim(),
            JobListingId = request.JobListingId
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        var dto = MapToDto(notification);

        await _hubContext.Clients.User(notification.UserId.ToString())
            .SendAsync("NotificationCreated", dto);

        await SendUnreadCountAsync(notification.UserId);

        return dto;
    }

    public async Task<List<NotificationDto>> GetMyNotificationsAsync(Guid userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return notifications.Select(MapToDto).ToList();
    }

    public Task<int> GetUnreadCountAsync(Guid userId)
    {
        return _context.Notifications.CountAsync(notification =>
            notification.UserId == userId && !notification.IsRead);
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
        await SendUnreadCountAsync(userId);
    }

    public async Task MarkAsReadAsync(Guid userId, Guid notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(item =>
                item.Id == notificationId && item.UserId == userId)
            ?? throw new InvalidOperationException("Notification not found.");

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        await _hubContext.Clients.User(userId.ToString())
            .SendAsync("NotificationRead", notificationId.ToString());

        await SendUnreadCountAsync(userId);
    }

    private async Task SendUnreadCountAsync(Guid userId)
    {
        var unreadCount = await GetUnreadCountAsync(userId);

        await _hubContext.Clients.User(userId.ToString())
            .SendAsync("UnreadNotificationCountChanged", unreadCount);
    }

    private static NotificationDto MapToDto(Notification notification) => new()
    {
        Id = notification.Id,
        JobListingId = notification.JobListingId,
        Message = notification.Message,
        IsRead = notification.IsRead,
        CreatedAt = notification.CreatedAt
    };
}
