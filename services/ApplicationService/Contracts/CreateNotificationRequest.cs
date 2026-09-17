namespace ApplicationService.Contracts;

public class CreateNotificationRequest
{
    public Guid UserId { get; set; }
    public Guid? JobListingId { get; set; }
    public string Message { get; set; } = string.Empty;
}
