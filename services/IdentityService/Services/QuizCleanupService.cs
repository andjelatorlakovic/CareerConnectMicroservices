using IdentityService.Interfaces;

namespace IdentityService.Services;

public class QuizCleanupService(
    HttpClient httpClient,
    IConfiguration configuration) : IQuizCleanupService
{
    public async Task DeleteQuizDataForJobAsync(Guid jobId)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Delete,
            $"api/quiz/internal/jobs/{jobId}");

        request.Headers.TryAddWithoutValidation(
            "X-Internal-Api-Key",
            configuration["InternalApiKey"]);

        using var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }
}
