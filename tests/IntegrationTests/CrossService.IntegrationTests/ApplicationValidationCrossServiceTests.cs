using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using ApplicationService.DTOs;

namespace CrossService.IntegrationTests;

public class ApplicationValidationCrossServiceTests
    : IClassFixture<CrossServiceApplicationFactory>
{
    private readonly CrossServiceApplicationFactory _factory;

    public ApplicationValidationCrossServiceTests(
        CrossServiceApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ApplyToClosedJob_ReturnsBadRequest()
    {
        await _factory.ResetDatabasesAsync();

        var candidateToken = TestJwt.Create(Guid.NewGuid(), "Candidate");
        var companyToken = TestJwt.Create(Guid.NewGuid(), "Company");
        await CreateCandidateProfileAsync(candidateToken);
        var jobId = await CreateJobAsync(companyToken);

        var companyClient = _factory.CompanyServer.CreateClient();
        companyClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", companyToken);
        var closeResponse = await companyClient.PatchAsync(
            $"/api/jobs/{jobId}/close",
            content: null);
        Assert.Equal(HttpStatusCode.NoContent, closeResponse.StatusCode);

        var applicationClient = CreateApplicationClient(candidateToken);
        var response = await applicationClient.PostAsJsonAsync(
            $"/api/job-applications/jobs/{jobId}",
            new CreateJobApplicationRequest { CoverLetter = "I would like to apply." });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ApplyWithUnansweredQuestion_ReturnsBadRequest()
    {
        await _factory.ResetDatabasesAsync();

        var candidateToken = TestJwt.Create(Guid.NewGuid(), "Candidate");
        var companyToken = TestJwt.Create(Guid.NewGuid(), "Company");
        await CreateCandidateProfileAsync(candidateToken);
        var jobId = await CreateJobAsync(companyToken);
        await _factory.QuizServer.SeedQuestionAsync(jobId);

        var response = await CreateApplicationClient(candidateToken)
            .PostAsJsonAsync(
                $"/api/job-applications/jobs/{jobId}",
                new CreateJobApplicationRequest { CoverLetter = "I would like to apply." });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private HttpClient CreateApplicationClient(string token)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private async Task CreateCandidateProfileAsync(string token)
    {
        var client = _factory.CandidateServer.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/candidate-profile");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private async Task<Guid> CreateJobAsync(string companyToken)
    {
        var client = _factory.CompanyServer.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", companyToken);

        var response = await client.PostAsJsonAsync("/api/jobs", new
        {
            title = "Application Validation Developer",
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

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var document = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync());
        return document.RootElement.GetProperty("id").GetGuid();
    }
}
