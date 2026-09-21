using System.Net.Http.Json;
using ApplicationService.DTOs;
using ApplicationService.Interfaces;

namespace ApplicationService.Services;

public class QuizService(HttpClient httpClient) : IQuizService
{
    public async Task SaveAnswersAsync(
        Guid applicationId,
        List<SubmitAnswerRequest> answers,
        string authorizationHeader)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"api/quiz/applications/{applicationId}/answers")
        {
            Content = JsonContent.Create(answers)
        };

        request.Headers.TryAddWithoutValidation(
            "Authorization",
            authorizationHeader);

        using var response = await httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                "Application answers could not be saved.");
        }
    }
}
