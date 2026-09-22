using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using ApplicationService.DTOs;

namespace CrossService.IntegrationTests;

public class ApplicationCandidateCompanyCrossServiceTests
    : IClassFixture<CrossServiceApplicationFactory>
{
    private readonly CrossServiceApplicationFactory _factory;

    public ApplicationCandidateCompanyCrossServiceTests(
        CrossServiceApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Apply_UsesActualCandidateAndCompanyHttpServices()
    {
        await _factory.ResetDatabasesAsync();

        var candidateUserId = Guid.NewGuid();
        var companyUserId = Guid.NewGuid();
        var candidateToken = TestJwt.Create(candidateUserId, "Candidate");
        var companyToken = TestJwt.Create(companyUserId, "Company");

        var candidateClient = _factory.CandidateServer.CreateClient();
        candidateClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", candidateToken);

        var candidateProfileResponse = await candidateClient.GetAsync(
            "/api/candidate-profile");
        Assert.Equal(HttpStatusCode.OK, candidateProfileResponse.StatusCode);

        var companyClient = _factory.CompanyServer.CreateClient();
        companyClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", companyToken);

        var createJobResponse = await companyClient.PostAsJsonAsync(
            "/api/jobs",
            new
            {
                title = "Cross-service Backend Developer",
                description = "Develop reliable backend services in a distributed system.",
                location = "Novi Sad",
                experienceLevel = "Junior",
                jobCategory = "SoftwareDevelopment",
                employmentType = "FullTime",
                expiresAt = DateTime.UtcNow.AddDays(30),
                skills = new[] { "CSharp", "SQL" },
                salaryMin = 1000,
                salaryMax = 1500
            });

        Assert.Equal(HttpStatusCode.Created, createJobResponse.StatusCode);

        using var jobJson = JsonDocument.Parse(
            await createJobResponse.Content.ReadAsStringAsync());
        var jobId = jobJson.RootElement.GetProperty("id").GetGuid();

        var applicationClient = _factory.CreateClient();
        applicationClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", candidateToken);

        var applyResponse = await applicationClient.PostAsJsonAsync(
            $"/api/job-applications/jobs/{jobId}",
            new CreateJobApplicationRequest
            {
                CoverLetter = "I am interested in this position and its backend technologies."
            });

        var body = await applyResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, applyResponse.StatusCode);
        Assert.Contains(jobId.ToString(), body);
        Assert.Contains("Pending", body);
    }
}
