using System.Net;
using System.Net.Http.Headers;

namespace MatchingService.IntegrationTests;

public class MatchingIntegrationTests : IClassFixture<MatchingApiFactory>
{
    private readonly MatchingApiFactory _factory;

    public MatchingIntegrationTests(MatchingApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetMatchingJobs_ReturnsOnlyActiveMatchingJobs()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer", TestJwt.Create(Guid.NewGuid()));

        var response = await client.GetAsync("/api/matching/jobs");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("Backend Developer", body);
        Assert.Contains("50", body);
        Assert.DoesNotContain("Closed Developer Position", body);
    }
}
