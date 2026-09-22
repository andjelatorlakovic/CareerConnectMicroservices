using ApplicationService.Contracts;
using ApplicationService.Data;
using ApplicationService.DTOs;
using ApplicationService.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ApplicationService.IntegrationTests;

public sealed class ApplicationApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public ApplicationApiFactory()
    {
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(_connection));

            services.RemoveAll<ICandidateService>();
            services.RemoveAll<ICompanyService>();
            services.RemoveAll<IQuizService>();
            services.RemoveAll<INotificationService>();

            services.AddSingleton<ICandidateService, FakeCandidateService>();
            services.AddSingleton<ICompanyService, FakeCompanyService>();
            services.AddSingleton<IQuizService, FakeQuizService>();
            services.AddSingleton<INotificationService, FakeNotificationService>();
        });
    }

    public async Task ResetDatabaseAsync()
    {
        FakeQuizService.Questions.Clear();
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

internal sealed class FakeCandidateService : ICandidateService
{
    public static Guid CandidateProfileId { get; } = Guid.NewGuid();
    public static Guid CandidateUserId { get; } = Guid.NewGuid();

    public Task<Guid> GetMyProfileIdAsync(string authorizationHeader) =>
        Task.FromResult(CandidateProfileId);

    public Task<Guid> GetUserIdByProfileIdAsync(Guid candidateProfileId) =>
        Task.FromResult(CandidateUserId);
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
                CompanyProfileId = CompanyProfileId,
                ExpiresAt = DateTime.UtcNow.AddDays(10),
                Status = "Active"
            }
            : null);
}

internal sealed class FakeQuizService : IQuizService
{
    public static List<JobListingQuestionDto> Questions { get; } = [];

    public Task<List<JobListingQuestionDto>> GetQuestionsAsync(
        Guid jobId,
        string authorizationHeader) => Task.FromResult(Questions.ToList());

    public Task SaveAnswersAsync(
        Guid applicationId,
        List<ApplicationService.DTOs.SubmitAnswerRequest> answers,
        string authorizationHeader) => Task.CompletedTask;
}

internal sealed class FakeNotificationService : INotificationService
{
    public Task CreateAsync(CreateNotificationRequest request) => Task.CompletedTask;

    public Task PublishRealtimeEventAsync<T>(string eventName, T payload) =>
        Task.CompletedTask;
}
