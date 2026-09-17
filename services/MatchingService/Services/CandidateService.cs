using System.Net.Http.Json;
using MatchingService.Contracts;
using MatchingService.Interfaces;

namespace MatchingService.Services;

public class CandidateService(HttpClient httpClient) : ICandidateService
{
    public async Task<CandidateProfileDto> GetMyProfileAsync(
        string authorizationHeader)
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

        return await response.Content
            .ReadFromJsonAsync<CandidateProfileDto>()
            ?? throw new InvalidOperationException(
                "Candidate profile is not available.");
    }
}