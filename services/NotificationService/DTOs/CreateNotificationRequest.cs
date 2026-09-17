using System.ComponentModel.DataAnnotations;

namespace NotificationService.DTOs;

public class CreateNotificationRequest
{
    [Required]
    public Guid UserId { get; set; }

    public Guid? JobListingId { get; set; }

    [Required]
    [StringLength(1000, MinimumLength = 3)]
    public string Message { get; set; } = string.Empty;
}
