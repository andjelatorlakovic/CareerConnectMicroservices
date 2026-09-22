using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace CrossService.IntegrationTests;

public class MatchingCrossServiceTests
    : IClassFixture<MatchingCrossServiceFactory>
{
    private readonly MatchingCrossServiceFactory _factory;

    public MatchingCrossServiceTests(MatchingCrossServiceFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetMatchingJobs_UsesActualCandidateAndCompanyHttpServices()
    {
        await _factory.ResetDatabasesAsync();

        var candidateToken = TestJwt.Create(Guid.NewGuid(), "Candidate");
        var companyToken = TestJwt.Create(Guid.NewGuid(), "Company");

        await CreateCandidateProfileAsync(candidateToken);
        var jobId = await CreateJobAsync(companyToken);

        var matchingClient = _factory.CreateClient();
        matchingClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", candidateToken);

        var response = await matchingClient.GetAsync("/api/matching/jobs");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var document = JsonDocument.Parse(body);
        var matchingJob = document.RootElement
            .EnumerateArray()
            .Single(job => job.GetProperty("jobId").GetGuid() == jobId);

        Assert.Equal(100m, matchingJob
            .GetProperty("matchPercentage")
            .GetDecimal());
    }

    private async Task CreateCandidateProfileAsync(string token)
    {
        var client = _factory.CandidateServer.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        Assert.Equal(
            HttpStatusCode.OK,
            (await client.GetAsync("/api/candidate-profile")).StatusCode);

        var updateResponse = await client.PutAsJsonAsync(
            "/api/candidate-profile",
            new
            {
                bio = "I am a junior backend developer with CSharp and SQL experience.",
                location = "Novi Sad",
                experienceLevel = "Junior",
                skills = new[] { "CSharp", "SQL" },
                desiredJobCategories = new[] { "SoftwareDevelopment" }
            });

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
    }

    private async Task<Guid> CreateJobAsync(string token)
    {
        var client = _factory.CompanyServer.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PostAsJsonAsync("/api/jobs", new
        {
            title = "Matching Cross-Service Developer",
            description = "Develop and maintain a reliable backend application.",
            location = "Novi Sad",
            experienceLevel = "Junior",
            jobCategory = "SoftwareDevelopment",
            employmentType = "FullTime",
            expiresAt = DateTime.UtcNow.AddDays(30),
            skills = new[] { "CSharp", "SQL" },
            salaryMin = 1000,
            salaryMax = 1500
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var document = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync());
        return document.RootElement.GetProperty("id").GetGuid();
    }
}
