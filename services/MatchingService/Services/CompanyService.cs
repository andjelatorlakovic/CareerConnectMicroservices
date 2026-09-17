using System.Net.Http.Json;
using MatchingService.Contracts;
using MatchingService.Interfaces;

namespace MatchingService.Services;

public class CompanyService(HttpClient httpClient) : ICompanyService
{
    public async Task<List<JobListingDto>> GetJobsAsync(
        string authorizationHeader)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            "api/jobs");

        request.Headers.TryAddWithoutValidation(
            "Authorization",
            authorizationHeader);

        using var response = await httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                "Job listings are not available.");
        }

        return await response.Content
            .ReadFromJsonAsync<List<JobListingDto>>()
            ?? [];
    }
}
