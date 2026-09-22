using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using CandidateService.DTOs;
using CandidateService.Enums;

namespace CandidateService.IntegrationTests;

public class CandidateProfileIntegrationTests
    : IClassFixture<CandidateApiFactory>
{
    private readonly CandidateApiFactory _factory;

    public CandidateProfileIntegrationTests(CandidateApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetThenUpdateProfile_PersistsCandidateData()
    {
        await _factory.ResetDatabaseAsync();
        var client = CreateCandidateClient(Guid.NewGuid());

        var initialResponse = await client.GetAsync("/api/candidate-profile");
        Assert.Equal(HttpStatusCode.OK, initialResponse.StatusCode);

        var updateResponse = await client.PutAsJsonAsync(
            "/api/candidate-profile",
            new UpdateCandidateProfileRequest
            {
                Bio = "I am a software developer interested in backend systems.",
                Location = "Novi Sad",
                ExperienceLevel = ExperienceLevel.Junior,
                Skills = [Skill.CSharp, Skill.SQL],
                DesiredJobCategories = [JobCategory.SoftwareDevelopment]
            });

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var profileResponse = await client.GetAsync("/api/candidate-profile");
        var body = await profileResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, profileResponse.StatusCode);
        Assert.Contains("Novi Sad", body);
        Assert.Contains("CSharp", body);
    }

    [Fact]
    public async Task AddEducation_AppearsInCandidateProfile()
    {
        await _factory.ResetDatabaseAsync();
        var client = CreateCandidateClient(Guid.NewGuid());

        await client.GetAsync("/api/candidate-profile");

        var addResponse = await client.PostAsJsonAsync(
            "/api/candidate-profile/education",
            new AddEducationRequest
            {
                Institution = "Faculty of Technical Sciences",
                Degree = "Bachelor degree",
                FieldOfStudy = "Software Engineering",
                StartDate = new DateTime(2020, 10, 1),
                EndDate = new DateTime(2024, 9, 1)
            });

        Assert.Equal(HttpStatusCode.OK, addResponse.StatusCode);

        var profileResponse = await client.GetAsync("/api/candidate-profile");
        using var profile = JsonDocument.Parse(
            await profileResponse.Content.ReadAsStringAsync());

        var education = profile.RootElement.GetProperty("education");
        Assert.Single(education.EnumerateArray());
        Assert.Equal(
            "Faculty of Technical Sciences",
            education[0].GetProperty("institution").GetString());
    }

    [Fact]
    public async Task GetProfile_WithoutToken_ReturnsUnauthorized()
    {
        await _factory.ResetDatabaseAsync();

        var response = await _factory.CreateClient()
            .GetAsync("/api/candidate-profile");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private HttpClient CreateCandidateClient(Guid userId)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", TestJwt.Create(userId, "Candidate"));
        return client;
    }
}
