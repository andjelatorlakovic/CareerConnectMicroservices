using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using ApplicationService.DTOs;
using ApplicationService.Enums;

namespace ApplicationService.IntegrationTests;

public class JobApplicationIntegrationTests
    : IClassFixture<ApplicationApiFactory>
{
    private readonly ApplicationApiFactory _factory;

    public JobApplicationIntegrationTests(ApplicationApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ApplyThenGetMyApplications_ReturnsPersistedApplication()
    {
        await _factory.ResetDatabaseAsync();
        var client = CreateClient("Candidate");

        var applyResponse = await client.PostAsJsonAsync(
            $"/api/job-applications/jobs/{FakeCompanyService.JobId}",
            new CreateJobApplicationRequest
            {
                CoverLetter = "I would like to apply for this backend developer role."
            });

        Assert.Equal(HttpStatusCode.OK, applyResponse.StatusCode);

        var applicationsResponse = await client.GetAsync("/api/job-applications/my");
        var body = await applicationsResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, applicationsResponse.StatusCode);
        Assert.Contains(FakeCompanyService.JobId.ToString(), body);
        Assert.Contains("Pending", body);
    }

    [Fact]
    public async Task UpdateStatus_ChangesExistingApplication()
    {
        await _factory.ResetDatabaseAsync();
        var candidateClient = CreateClient("Candidate");

        var applyResponse = await candidateClient.PostAsJsonAsync(
            $"/api/job-applications/jobs/{FakeCompanyService.JobId}",
            new CreateJobApplicationRequest { CoverLetter = "Motivation letter" });

        using var createdJson = JsonDocument.Parse(
            await applyResponse.Content.ReadAsStringAsync());
        var applicationId = createdJson.RootElement
            .GetProperty("id")
            .GetGuid();

        var companyClient = CreateClient("Company");
        var updateResponse = await companyClient.PatchAsJsonAsync(
            $"/api/job-applications/{applicationId}/status",
            new UpdateJobApplicationRequest { Status = ApplicationStatus.Reviewed });

        var body = await updateResponse.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.Contains("Reviewed", body);
    }

    [Fact]
    public async Task ApplyTwiceForSameJob_ReturnsBadRequest()
    {
        await _factory.ResetDatabaseAsync();
        var client = CreateClient("Candidate");
        var request = new CreateJobApplicationRequest
        {
            CoverLetter = "I would like to apply for this backend developer role."
        };

        var firstResponse = await client.PostAsJsonAsync(
            $"/api/job-applications/jobs/{FakeCompanyService.JobId}",
            request);
        var secondResponse = await client.PostAsJsonAsync(
            $"/api/job-applications/jobs/{FakeCompanyService.JobId}",
            request);

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);
    }

    [Fact]
    public async Task UpdateStatus_WithCandidateToken_ReturnsForbidden()
    {
        await _factory.ResetDatabaseAsync();
        var candidateClient = CreateClient("Candidate");

        var applyResponse = await candidateClient.PostAsJsonAsync(
            $"/api/job-applications/jobs/{FakeCompanyService.JobId}",
            new CreateJobApplicationRequest { CoverLetter = "Motivation letter" });

        using var createdJson = JsonDocument.Parse(
            await applyResponse.Content.ReadAsStringAsync());
        var applicationId = createdJson.RootElement.GetProperty("id").GetGuid();

        var response = await candidateClient.PatchAsJsonAsync(
            $"/api/job-applications/{applicationId}/status",
            new UpdateJobApplicationRequest { Status = ApplicationStatus.Accepted });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private HttpClient CreateClient(string role)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer", TestJwt.Create(Guid.NewGuid(), role));
        return client;
    }
}
