using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CompanyService.DTOs.CompanyProfile;
using CompanyService.DTOs.JobListing;
using CompanyService.Enums;

namespace CompanyService.IntegrationTests;

public class CompanyIntegrationTests : IClassFixture<CompanyApiFactory>
{
    private readonly CompanyApiFactory _factory;

    public CompanyIntegrationTests(CompanyApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task UpdateProfile_WithEmptyWebsite_SavesProfile()
    {
        await _factory.ResetDatabaseAsync();
        var client = CreateCompanyClient(Guid.NewGuid());

        var createResponse = await client.GetAsync("/api/company-profile/profile");
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);

        var updateResponse = await client.PutAsJsonAsync(
            "/api/company-profile/profile",
            new UpdateCompanyProfileDto
            {
                Name = "Career Connect",
                Description = "A company focused on modern recruitment software.",
                Location = "Novi Sad",
                Website = null,
                Industry = "Information technology",
                ContactEmail = "contact@careerconnect.test",
                ContactPhone = "+381601234567"
            });

        var body = await updateResponse.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.Contains("Career Connect", body);
    }

    [Fact]
    public async Task CreateJob_ThenGetAll_ReturnsCreatedJob()
    {
        await _factory.ResetDatabaseAsync();
        var client = CreateCompanyClient(Guid.NewGuid());

        var createResponse = await client.PostAsJsonAsync(
            "/api/jobs",
            new CreateJobListingRequest
            {
                Title = "Backend Developer",
                Description = "Develop and maintain reliable backend services for users.",
                Location = "Novi Sad",
                ExperienceLevel = ExperienceLevel.Junior,
                JobCategory = JobCategory.SoftwareDevelopment,
                EmploymentType = EmploymentType.FullTime,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                Skills = [Skill.CSharp, Skill.SQL],
                SalaryMin = 1000,
                SalaryMax = 1500
            });

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var jobsResponse = await client.GetAsync("/api/jobs");
        var body = await jobsResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, jobsResponse.StatusCode);
        Assert.Contains("Backend Developer", body);
    }

    [Fact]
    public async Task UpdateAnotherCompanyJob_ReturnsNotFound()
    {
        await _factory.ResetDatabaseAsync();
        var ownerClient = CreateCompanyClient(Guid.NewGuid());

        var createResponse = await ownerClient.PostAsJsonAsync(
            "/api/jobs",
            CreateJobRequest("Owned job"));
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var body = await createResponse.Content.ReadAsStringAsync();
        using var document = System.Text.Json.JsonDocument.Parse(body);
        var jobId = document.RootElement.GetProperty("id").GetGuid();

        var otherCompanyClient = CreateCompanyClient(Guid.NewGuid());
        var updateResponse = await otherCompanyClient.PutAsJsonAsync(
            $"/api/jobs/{jobId}",
            new UpdateJobListingRequest
            {
                Title = "Changed title",
                Description = "A valid description that the second company must not save.",
                Location = "Novi Sad",
                ExperienceLevel = ExperienceLevel.Junior,
                JobCategory = JobCategory.SoftwareDevelopment,
                EmploymentType = EmploymentType.FullTime,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                Skills = [Skill.CSharp],
                SalaryMin = 1000,
                SalaryMax = 1500
            });

        Assert.Equal(HttpStatusCode.NotFound, updateResponse.StatusCode);
    }

    [Fact]
    public async Task CreateJob_WithCandidateToken_ReturnsForbidden()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", TestJwt.Create(
                Guid.NewGuid(),
                "Candidate"));

        var response = await client.PostAsJsonAsync(
            "/api/jobs",
            CreateJobRequest("Candidate job"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private static CreateJobListingRequest CreateJobRequest(string title) => new()
    {
        Title = title,
        Description = "Develop and maintain reliable backend services for users.",
        Location = "Novi Sad",
        ExperienceLevel = ExperienceLevel.Junior,
        JobCategory = JobCategory.SoftwareDevelopment,
        EmploymentType = EmploymentType.FullTime,
        ExpiresAt = DateTime.UtcNow.AddDays(30),
        Skills = [Skill.CSharp, Skill.SQL],
        SalaryMin = 1000,
        SalaryMax = 1500
    };

    private HttpClient CreateCompanyClient(Guid userId)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", TestJwt.Create(userId, "Company"));
        return client;
    }
}
