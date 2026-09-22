using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using QuizService.DTOs;

namespace QuizService.IntegrationTests;

public class QuizIntegrationTests : IClassFixture<QuizApiFactory>
{
    private readonly QuizApiFactory _factory;

    public QuizIntegrationTests(QuizApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task AddQuestion_ThenGetQuestions_ReturnsSavedQuestion()
    {
        await _factory.ResetDatabaseAsync();
        var client = CreateClient("Company");

        var addResponse = await client.PostAsJsonAsync(
            $"/api/quiz/jobs/{FakeCompanyService.JobId}/questions",
            new AddQuestionRequest
            {
                QuestionText = "How many years of C# experience do you have?",
                OrderIndex = 1
            });

        Assert.Equal(HttpStatusCode.OK, addResponse.StatusCode);

        var getResponse = await client.GetAsync(
            $"/api/quiz/jobs/{FakeCompanyService.JobId}/questions");
        var body = await getResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.Contains("C# experience", body);
    }

    [Fact]
    public async Task SubmitAnswers_SavesAnswerForApplication()
    {
        await _factory.ResetDatabaseAsync();
        var companyClient = CreateClient("Company");

        var addResponse = await companyClient.PostAsJsonAsync(
            $"/api/quiz/jobs/{FakeCompanyService.JobId}/questions",
            new AddQuestionRequest
            {
                QuestionText = "Describe your experience with SQL databases.",
                OrderIndex = 1
            });

        using var questionJson = JsonDocument.Parse(
            await addResponse.Content.ReadAsStringAsync());
        var questionId = questionJson.RootElement.GetProperty("id").GetGuid();

        var candidateClient = CreateClient("Candidate");
        var saveResponse = await candidateClient.PostAsJsonAsync(
            $"/api/quiz/applications/{FakeJobApplicationService.ApplicationId}/answers",
            new List<SubmitAnswerRequest>
            {
                new()
                {
                    QuestionId = questionId,
                    Answer = "I have used SQL Server and PostgreSQL in several projects."
                }
            });

        Assert.Equal(HttpStatusCode.NoContent, saveResponse.StatusCode);

        var answersResponse = await companyClient.GetAsync(
            $"/api/quiz/applications/{FakeJobApplicationService.ApplicationId}/answers");
        var body = await answersResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, answersResponse.StatusCode);
        Assert.Contains("PostgreSQL", body);
    }

    private HttpClient CreateClient(string role)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer", TestJwt.Create(Guid.NewGuid(), role));
        return client;
    }
}
