using System.Net.Http.Json;
using ApplicationService.Contracts;
using ApplicationService.Interfaces;

namespace ApplicationService.Services;

public class NotificationService(
    HttpClient httpClient,
    IConfiguration configuration) : INotificationService
{
    public async Task CreateAsync(CreateNotificationRequest request)
    {
        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Post,
            "api/notifications/internal")
        {
            Content = JsonContent.Create(request)
        };

        httpRequest.Headers.TryAddWithoutValidation(
            "X-Internal-Api-Key",
            configuration["InternalApiKey"]);

        using var response = await httpClient.SendAsync(httpRequest);
        response.EnsureSuccessStatusCode();
    }

    public async Task PublishRealtimeEventAsync<T>(
        string eventName,
        T payload)
    {
        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Post,
            "api/notifications/internal/realtime")
        {
            Content = JsonContent.Create(new { eventName, payload })
        };

        httpRequest.Headers.TryAddWithoutValidation(
            "X-Internal-Api-Key",
            configuration["InternalApiKey"]);

        using var response = await httpClient.SendAsync(httpRequest);
        response.EnsureSuccessStatusCode();
    }
}
