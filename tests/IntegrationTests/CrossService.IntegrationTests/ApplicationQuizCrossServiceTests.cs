using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using ApplicationService.DTOs;

namespace CrossService.IntegrationTests;

public class ApplicationQuizCrossServiceTests
    : IClassFixture<CrossServiceApplicationFactory>
{
    private readonly CrossServiceApplicationFactory _factory;

    public ApplicationQuizCrossServiceTests(CrossServiceApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ApplyWithAnswers_SavesAnswersThroughQuizService()
    {
        await _factory.ResetDatabasesAsync();

        var candidateToken = TestJwt.Create(Guid.NewGuid(), "Candidate");
        var companyToken = TestJwt.Create(Guid.NewGuid(), "Company");

        var candidateClient = _factory.CandidateServer.CreateClient();
        candidateClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", candidateToken);
        Assert.Equal(
            HttpStatusCode.OK,
            (await candidateClient.GetAsync("/api/candidate-profile")).StatusCode);

        var companyClient = _factory.CompanyServer.CreateClient();
        companyClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", companyToken);

        var jobResponse = await companyClient.PostAsJsonAsync("/api/jobs", new
        {
            title = "Quiz Test Developer",
            description = "Develop and maintain a reliable backend application.",
            location = "Novi Sad",
            experienceLevel = "Junior",
            jobCategory = "SoftwareDevelopment",
            employmentType = "FullTime",
            expiresAt = DateTime.UtcNow.AddDays(30),
            skills = new[] { "CSharp" },
            salaryMin = 1000,
            salaryMax = 1500
        });

        Assert.Equal(HttpStatusCode.Created, jobResponse.StatusCode);
        using var jobJson = JsonDocument.Parse(await jobResponse.Content.ReadAsStringAsync());
        var jobId = jobJson.RootElement.GetProperty("id").GetGuid();
        var questionId = await _factory.QuizServer.SeedQuestionAsync(jobId);

        var applicationClient = _factory.CreateClient();
        applicationClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", candidateToken);

        var applyResponse = await applicationClient.PostAsJsonAsync(
            $"/api/job-applications/jobs/{jobId}",
            new CreateJobApplicationRequest
            {
                CoverLetter = "I would like to apply and answer the required question.",
                Answers =
                [
                    new SubmitAnswerRequest
                    {
                        QuestionId = questionId,
                        Answer = "I have used PostgreSQL and SQL Server in multiple projects."
                    }
                ]
            });

        using var applicationJson = JsonDocument.Parse(
            await applyResponse.Content.ReadAsStringAsync());
        var applicationId = applicationJson.RootElement.GetProperty("id").GetGuid();

        Assert.Equal(HttpStatusCode.OK, applyResponse.StatusCode);
        Assert.True(await _factory.QuizServer.HasAnswerAsync(
            applicationId,
            questionId));
    }
}
