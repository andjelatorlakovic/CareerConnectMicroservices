extern alias MatchingApp;

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MatchingCandidateService = MatchingApp::MatchingService.Interfaces.ICandidateService;
using MatchingCompanyService = MatchingApp::MatchingService.Interfaces.ICompanyService;
using MatchingProgram = MatchingApp::Program;

namespace CrossService.IntegrationTests;

// This factory follows the same pattern as the monolith factory: a test host,
// test data, and an HttpClient. It owns separate test servers only because
// Candidate and Company have separate databases in the microservice version.
public sealed class MatchingCrossServiceFactory
    : WebApplicationFactory<MatchingProgram>
{
    public CandidateServerFactory CandidateServer { get; } = new();
    public CompanyServerFactory CompanyServer { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<MatchingCandidateService>();
            services.RemoveAll<MatchingCompanyService>();

            services.AddScoped<MatchingCandidateService>(_ =>
                new MatchingApp::MatchingService.Services.CandidateService(
                    CandidateServer.CreateClient()));

            services.AddScoped<MatchingCompanyService>(_ =>
                new MatchingApp::MatchingService.Services.CompanyService(
                    CompanyServer.CreateClient()));
        });
    }

    public async Task ResetDatabasesAsync()
    {
        await CandidateServer.ResetDatabaseAsync();
        await CompanyServer.ResetDatabaseAsync();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (!disposing) return;

        CandidateServer.Dispose();
        CompanyServer.Dispose();
    }
}
