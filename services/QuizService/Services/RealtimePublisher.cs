using System.Net.Http.Json;
using QuizService.Interfaces;

namespace QuizService.Services;

public class RealtimePublisher(
    HttpClient httpClient,
    IConfiguration configuration) : IRealtimePublisher
{
    public async Task PublishAsync<T>(string eventName, T payload)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "api/notifications/internal/realtime")
        {
            Content = JsonContent.Create(new { eventName, payload })
        };

        request.Headers.TryAddWithoutValidation(
            "X-Internal-Api-Key",
            configuration["InternalApiKey"]);

        using var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }
}
