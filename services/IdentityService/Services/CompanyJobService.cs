using IdentityService.Interfaces;

namespace IdentityService.Services;

public class CompanyJobService(
    HttpClient httpClient,
    IConfiguration configuration) : ICompanyJobService
{
    public async Task DeleteJobListingAsync(Guid jobId)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Delete,
            $"api/jobs/internal/{jobId}");

        request.Headers.TryAddWithoutValidation(
            "X-Internal-Api-Key",
            configuration["InternalApiKey"]);

        using var response = await httpClient.SendAsync(request);

        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new InvalidOperationException("Job listing not found.");
        }

        response.EnsureSuccessStatusCode();
    }
}
