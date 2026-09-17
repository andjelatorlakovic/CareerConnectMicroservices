using System.Net.Http.Json;
using ApplicationService.Contracts;
using ApplicationService.Interfaces;

namespace ApplicationService.Services;

public class CandidateService(
    HttpClient httpClient,
    IConfiguration configuration) : ICandidateService
{
    public async Task<Guid> GetMyProfileIdAsync(string authorizationHeader)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            "api/candidate-profile");

        request.Headers.TryAddWithoutValidation(
            "Authorization",
            authorizationHeader);

        using var response = await httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                "Candidate profile is not available.");
        }

        var profile = await response.Content
            .ReadFromJsonAsync<CandidateProfileDto>();

        return profile?.Id
            ?? throw new InvalidOperationException(
                "Candidate profile is not available.");
    }

    public async Task<Guid> GetUserIdByProfileIdAsync(
        Guid candidateProfileId)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"api/candidate-profile/{candidateProfileId}/internal/user-id");

        request.Headers.TryAddWithoutValidation(
            "X-Internal-Api-Key",
            configuration["InternalApiKey"]);

        using var response = await httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                "Candidate user is not available.");
        }

        var candidate = await response.Content
            .ReadFromJsonAsync<CandidateUserDto>();

        return candidate?.UserId
            ?? throw new InvalidOperationException(
                "Candidate user is not available.");
    }
}
