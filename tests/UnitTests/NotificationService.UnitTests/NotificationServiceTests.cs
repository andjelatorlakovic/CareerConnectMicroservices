using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using NotificationService.Controllers;
using NotificationService.DTOs;
using NotificationService.Interfaces;

namespace NotificationService.UnitTests;

public class NotificationDtoValidationTests
{
    [Fact]
    public void CreateNotification_WithShortMessage_IsInvalid()
    {
        var dto = new CreateNotificationRequest
        {
            UserId = Guid.NewGuid(),
            Message = "Hi"
        };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void CreateNotification_WithValidMessage_IsValid()
    {
        var dto = new CreateNotificationRequest
        {
            UserId = Guid.NewGuid(),
            Message = "Your application status has been updated."
        };

        Assert.True(IsValid(dto));
    }

    [Fact]
    public void PublishRealtimeEvent_WithoutEventName_IsInvalid()
    {
        var dto = new PublishRealtimeEventRequest { EventName = string.Empty };

        Assert.False(IsValid(dto));
    }

    [Fact]
    public void PublishRealtimeEvent_WithValidEventName_IsValid()
    {
        var dto = new PublishRealtimeEventRequest
        {
            EventName = "ApplicationStatusChanged"
        };

        Assert.True(IsValid(dto));
    }

    private static bool IsValid(object dto) => Validator.TryValidateObject(
        dto,
        new ValidationContext(dto),
        new List<ValidationResult>(),
        validateAllProperties: true);
}

public class NotificationControllerTests
{
    [Fact]
    public async Task GetMine_ReturnsNotificationsForCurrentUser()
    {
        var userId = Guid.NewGuid();
        var service = new Mock<INotificationService>();
        var notifications = new List<NotificationDto>
        {
            new() { Id = Guid.NewGuid(), Message = "New notification." }
        };

        service.Setup(item => item.GetMyNotificationsAsync(userId))
            .ReturnsAsync(notifications);

        var result = await CreateController(service.Object, userId).GetMine();

        Assert.Same(notifications, Assert.IsType<OkObjectResult>(result).Value);
    }

    [Fact]
    public async Task MarkAsRead_WithExistingNotification_ReturnsNoContent()
    {
        var userId = Guid.NewGuid();
        var notificationId = Guid.NewGuid();
        var service = new Mock<INotificationService>();

        service.Setup(item => item.MarkAsReadAsync(userId, notificationId))
            .Returns(Task.CompletedTask);

        var result = await CreateController(service.Object, userId)
            .MarkAsRead(notificationId);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task MarkAsRead_WithMissingNotification_ReturnsNotFound()
    {
        var userId = Guid.NewGuid();
        var service = new Mock<INotificationService>();

        service.Setup(item => item.MarkAsReadAsync(userId, It.IsAny<Guid>()))
            .ThrowsAsync(new InvalidOperationException("Notification not found."));

        var result = await CreateController(service.Object, userId)
            .MarkAsRead(Guid.NewGuid());

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task CreateInternal_WithWrongApiKey_ReturnsUnauthorized()
    {
        var controller = CreateController(Mock.Of<INotificationService>(), Guid.NewGuid());

        var result = await controller.CreateInternal(
            new CreateNotificationRequest
            {
                UserId = Guid.NewGuid(),
                Message = "A valid notification message."
            },
            "wrong-key",
            CreateConfiguration("correct-key"));

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task CreateInternal_WithCorrectApiKey_ReturnsCreatedNotification()
    {
        var request = new CreateNotificationRequest
        {
            UserId = Guid.NewGuid(),
            Message = "A valid notification message."
        };
        var expected = new NotificationDto { Id = Guid.NewGuid(), Message = request.Message };
        var service = new Mock<INotificationService>();
        service.Setup(item => item.CreateAsync(request)).ReturnsAsync(expected);

        var result = await CreateController(service.Object, Guid.NewGuid())
            .CreateInternal(request, "correct-key", CreateConfiguration("correct-key"));

        Assert.Same(expected, Assert.IsType<OkObjectResult>(result).Value);
    }

    private static NotificationController CreateController(
        INotificationService service,
        Guid userId)
    {
        var controller = new NotificationController(service);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(ClaimTypes.NameIdentifier, userId.ToString())],
                    "TestAuthentication"))
            }
        };
        return controller;
    }

    private static IConfiguration CreateConfiguration(string apiKey) =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["InternalApiKey"] = apiKey
            })
            .Build();
}
