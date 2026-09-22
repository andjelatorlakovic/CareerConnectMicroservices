using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using QuizService.Contracts;
using QuizService.Data;
using QuizService.Interfaces;

namespace QuizService.IntegrationTests;

public sealed class QuizApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public QuizApiFactory()
    {
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<QuizDbContext>>();
            services.AddDbContext<QuizDbContext>(options =>
                options.UseSqlite(_connection));

            services.RemoveAll<ICompanyService>();
            services.RemoveAll<IJobApplicationService>();
            services.RemoveAll<IRealtimePublisher>();
            services.AddSingleton<ICompanyService, FakeCompanyService>();
            services.AddSingleton<IJobApplicationService, FakeJobApplicationService>();
            services.AddSingleton<IRealtimePublisher, NoopRealtimePublisher>();
        });
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<QuizDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

internal sealed class FakeCompanyService : ICompanyService
{
    public static Guid CompanyProfileId { get; } = Guid.NewGuid();
    public static Guid JobId { get; } = Guid.NewGuid();

    public Task<Guid> GetMyProfileIdAsync(string authorizationHeader) =>
        Task.FromResult(CompanyProfileId);

    public Task<JobListingDto?> GetJobAsync(Guid jobId) =>
        Task.FromResult<JobListingDto?>(jobId == JobId
            ? new JobListingDto
            {
                Id = JobId,
                CompanyProfileId = CompanyProfileId
            }
            : null);
}

internal sealed class FakeJobApplicationService : IJobApplicationService
{
    public static Guid ApplicationId { get; } = Guid.NewGuid();

    public Task<JobApplicationDto?> GetApplicationAsync(
        Guid applicationId,
        string authorizationHeader) =>
        Task.FromResult<JobApplicationDto?>(applicationId == ApplicationId
            ? new JobApplicationDto
            {
                Id = ApplicationId,
                CandidateProfileId = Guid.NewGuid(),
                JobListingId = FakeCompanyService.JobId
            }
            : null);
}

internal sealed class NoopRealtimePublisher : IRealtimePublisher
{
    public Task PublishAsync<T>(string eventName, T payload) => Task.CompletedTask;
}
