using System.Net;
using System.Net.Http.Json;
using QuizService.Contracts;
using QuizService.Interfaces;

namespace QuizService.Services;

public class CompanyService(HttpClient httpClient) : ICompanyService
{
    public async Task<Guid> GetMyProfileIdAsync(string authorizationHeader)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            "api/company-profile/profile");

        request.Headers.TryAddWithoutValidation(
            "Authorization",
            authorizationHeader);

        using var response = await httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                "Company profile is not available.");
        }

        var profile = await response.Content
            .ReadFromJsonAsync<CompanyProfileDto>();

        return profile?.Id
            ?? throw new InvalidOperationException(
                "Company profile is not available.");
    }

    public async Task<JobListingDto?> GetJobAsync(Guid jobId)
    {
        using var response = await httpClient.GetAsync($"api/jobs/{jobId}");

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<JobListingDto>();
    }
}
