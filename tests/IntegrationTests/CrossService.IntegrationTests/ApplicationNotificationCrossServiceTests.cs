using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using ApplicationService.DTOs;

namespace CrossService.IntegrationTests;

public class ApplicationNotificationCrossServiceTests
    : IClassFixture<CrossServiceApplicationFactory>
{
    private readonly CrossServiceApplicationFactory _factory;

    public ApplicationNotificationCrossServiceTests(
        CrossServiceApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task UpdateStatus_CreatesNotificationForCandidate()
    {
        await _factory.ResetDatabasesAsync();

        var candidateUserId = Guid.NewGuid();
        var companyUserId = Guid.NewGuid();
        var candidateToken = TestJwt.Create(candidateUserId, "Candidate");
        var companyToken = TestJwt.Create(companyUserId, "Company");

        await CreateCandidateProfileAsync(candidateToken);
        var jobId = await CreateJobAsync(companyToken);

        var applicationClient = _factory.CreateClient();
        applicationClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", candidateToken);

        var applyResponse = await applicationClient.PostAsJsonAsync(
            $"/api/job-applications/jobs/{jobId}",
            new CreateJobApplicationRequest { CoverLetter = "I would like to apply." });

        using var applicationJson = JsonDocument.Parse(
            await applyResponse.Content.ReadAsStringAsync());
        var applicationId = applicationJson.RootElement.GetProperty("id").GetGuid();

        var companyApplicationClient = _factory.CreateClient();
        companyApplicationClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", companyToken);

        var updateResponse = await companyApplicationClient.PatchAsJsonAsync(
            $"/api/job-applications/{applicationId}/status",
            new { status = "Accepted" });

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var notificationClient = _factory.NotificationServer.CreateClient();
        notificationClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", candidateToken);

        var notificationsResponse = await notificationClient.GetAsync(
            "/api/notifications");
        var body = await notificationsResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, notificationsResponse.StatusCode);
        Assert.Contains("Accepted", body);
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
            title = "Notification Test Developer",
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
        using var jobJson = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return jobJson.RootElement.GetProperty("id").GetGuid();
    }
}
