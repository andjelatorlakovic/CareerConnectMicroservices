namespace NotificationService.Models;
public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid? JobListingId { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Notification()
    {
    }
    public Notification(
        Guid userId,
        string message,
        Guid? jobListingId = null)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        JobListingId = jobListingId;
        Message = message;
        IsRead = false;
        CreatedAt = DateTime.UtcNow;
    }
}
