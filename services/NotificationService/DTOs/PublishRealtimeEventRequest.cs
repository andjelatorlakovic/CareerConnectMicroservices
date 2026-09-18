using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace NotificationService.DTOs;

public class PublishRealtimeEventRequest
{
    [Required, StringLength(100)]
    public string EventName { get; set; } = string.Empty;

    public JsonElement? Payload { get; set; }
}
