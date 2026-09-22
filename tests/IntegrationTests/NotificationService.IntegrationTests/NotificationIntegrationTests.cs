using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using NotificationService.DTOs;

namespace NotificationService.IntegrationTests;

public class NotificationIntegrationTests
    : IClassFixture<NotificationApiFactory>
{
    private readonly NotificationApiFactory _factory;

    public NotificationIntegrationTests(NotificationApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateInternal_ThenGetMine_ReturnsNotification()
    {
        await _factory.ResetDatabaseAsync();
        var userId = Guid.NewGuid();
        var client = _factory.CreateClient();

        var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/notifications/internal")
        {
            Content = JsonContent.Create(new CreateNotificationRequest
            {
                UserId = userId,
                Message = "Your application status has changed."
            })
        };
        request.Headers.Add("X-Internal-Api-Key", "integration-test-internal-key");

        var createResponse = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", TestJwt.Create(userId));

        var getResponse = await client.GetAsync("/api/notifications");
        var body = await getResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.Contains("Your application status has changed.", body);
    }

    [Fact]
    public async Task MarkAsRead_ChangesUnreadCountToZero()
    {
        await _factory.ResetDatabaseAsync();
        var userId = Guid.NewGuid();
        var client = _factory.CreateClient();

        var createRequest = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/notifications/internal")
        {
            Content = JsonContent.Create(new CreateNotificationRequest
            {
                UserId = userId,
                Message = "A new notification is available."
            })
        };
        createRequest.Headers.Add(
            "X-Internal-Api-Key", "integration-test-internal-key");

        var createResponse = await client.SendAsync(createRequest);
        var notification = await createResponse.Content
            .ReadFromJsonAsync<NotificationDto>();

        Assert.NotNull(notification);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", TestJwt.Create(userId));

        var markReadResponse = await client.PatchAsync(
            $"/api/notifications/{notification.Id}/read", null);
        Assert.Equal(HttpStatusCode.NoContent, markReadResponse.StatusCode);

        var countResponse = await client.GetAsync(
            "/api/notifications/unread-count");
        using var count = JsonDocument.Parse(
            await countResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, countResponse.StatusCode);
        Assert.Equal(0, count.RootElement.GetProperty("count").GetInt32());
    }
}
