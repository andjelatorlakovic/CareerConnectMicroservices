using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.DTOs;
using NotificationService.Interfaces;

namespace NotificationService.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;
    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }
    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(value, out var userId))
            throw new UnauthorizedAccessException("User is not valid.");

        return userId;
    }
    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var notifications = await _notificationService.GetMyNotificationsAsync(GetUserId());
        return Ok(notifications);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        return Ok(new
        {
            count = await _notificationService.GetUnreadCountAsync(
                GetUserId())
        });
    }
    [HttpPatch("{notificationId}/read")]
    public async Task<IActionResult> MarkAsRead(Guid notificationId)
    {
        try
        {
            await _notificationService.MarkAsReadAsync(GetUserId(), notificationId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(GetUserId());
        return NoContent();
    }

    [HttpPost("internal")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateInternal(
        CreateNotificationRequest request,
        [FromHeader(Name = "X-Internal-Api-Key")] string? apiKey,
        [FromServices] IConfiguration configuration)
    {
        var expectedApiKey = configuration["InternalApiKey"];

        if (string.IsNullOrWhiteSpace(expectedApiKey) ||
            !string.Equals(apiKey, expectedApiKey, StringComparison.Ordinal))
        {
            return Unauthorized();
        }

        return Ok(await _notificationService.CreateAsync(request));
    }
}
