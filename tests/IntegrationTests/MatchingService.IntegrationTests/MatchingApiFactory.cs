using MatchingService.Contracts;
using MatchingService.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace MatchingService.IntegrationTests;

public sealed class MatchingApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<ICandidateService>();
            services.RemoveAll<ICompanyService>();
            services.AddSingleton<ICandidateService, FakeCandidateService>();
            services.AddSingleton<ICompanyService, FakeCompanyService>();
        });
    }
}

internal sealed class FakeCandidateService : ICandidateService
{
    public Task<CandidateProfileDto> GetMyProfileAsync(string authorizationHeader) =>
        Task.FromResult(new CandidateProfileDto
        {
            Id = Guid.NewGuid(),
            Skills = ["CSharp"],
            DesiredJobCategories = ["SoftwareDevelopment"]
        });
}

internal sealed class FakeCompanyService : ICompanyService
{
    public Task<List<JobListingDto>> GetJobsAsync(string authorizationHeader) =>
        Task.FromResult(new List<JobListingDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Backend Developer",
                Location = "Novi Sad",
                JobCategory = "SoftwareDevelopment",
                Status = "Active",
                ExpiresAt = DateTime.UtcNow.AddDays(10),
                Skills = ["CSharp", "SQL"]
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Closed Developer Position",
                Location = "Novi Sad",
                JobCategory = "SoftwareDevelopment",
                Status = "Closed",
                ExpiresAt = DateTime.UtcNow.AddDays(10),
                Skills = ["CSharp"]
            }
        });
}
