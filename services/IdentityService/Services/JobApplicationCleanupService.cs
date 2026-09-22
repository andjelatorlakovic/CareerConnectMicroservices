using IdentityService.Interfaces;

namespace IdentityService.Services;

public class JobApplicationCleanupService(
    HttpClient httpClient,
    IConfiguration configuration) : IJobApplicationCleanupService
{
    public async Task DeleteApplicationsForJobAsync(Guid jobId)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Delete,
            $"api/job-applications/internal/jobs/{jobId}");

        request.Headers.TryAddWithoutValidation(
            "X-Internal-Api-Key",
            configuration["InternalApiKey"]);

        using var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }
}
