using System.Net;
using System.Net.Http.Json;
using QuizService.Contracts;
using QuizService.Interfaces;

namespace QuizService.Services;

public class JobApplicationService(HttpClient httpClient) : IJobApplicationService
{
    public async Task<JobApplicationDto?> GetApplicationAsync(
        Guid applicationId,
        string authorizationHeader)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"api/job-applications/{applicationId}/internal");

        request.Headers.TryAddWithoutValidation(
            "Authorization",
            authorizationHeader);

        using var response = await httpClient.SendAsync(request);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();

        return await response.Content
            .ReadFromJsonAsync<JobApplicationDto>();
    }
}
