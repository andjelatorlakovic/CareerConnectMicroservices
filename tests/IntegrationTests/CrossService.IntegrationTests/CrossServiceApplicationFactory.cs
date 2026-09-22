extern alias CandidateApp;
extern alias CompanyApp;
extern alias NotificationApp;
extern alias QuizApp;

using ApplicationService.Data;
using ApplicationService.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using CandidateDbContext = CandidateApp::CandidateService.Data.CandidateDbContext;
using CandidateProgram = CandidateApp::Program;
using CompanyDbContext = CompanyApp::CompanyService.Data.CompanyDbContext;
using CompanyProgram = CompanyApp::Program;
using CompanyRealtimePublisher = CompanyApp::CompanyService.Interfaces.IRealtimePublisher;
using NotificationDbContext = NotificationApp::NotificationService.Data.NotificationDbContext;
using NotificationProgram = NotificationApp::Program;
using QuizDbContext = QuizApp::QuizService.Data.QuizDbContext;
using QuizProgram = QuizApp::Program;
using QuizQuestion = QuizApp::QuizService.Models.JobListingQuestion;
using QuizCompanyService = QuizApp::QuizService.Interfaces.ICompanyService;
using QuizJobApplicationService = QuizApp::QuizService.Interfaces.IJobApplicationService;
using QuizRealtimePublisher = QuizApp::QuizService.Interfaces.IRealtimePublisher;
using QuizJobListingDto = QuizApp::QuizService.Contracts.JobListingDto;
using QuizJobApplicationDto = QuizApp::QuizService.Contracts.JobApplicationDto;

namespace CrossService.IntegrationTests;

public sealed class CrossServiceApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public CandidateServerFactory CandidateServer { get; } = new();
    public CompanyServerFactory CompanyServer { get; } = new();
    public NotificationServerFactory NotificationServer { get; } = new();
    public QuizServerFactory QuizServer { get; } = new();

    public CrossServiceApplicationFactory()
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

            services.AddScoped<ICandidateService>(serviceProvider =>
                new ApplicationService.Services.CandidateService(
                    CandidateServer.CreateClient(),
                    serviceProvider.GetRequiredService<IConfiguration>()));

            services.AddScoped<ICompanyService>(_ =>
                new ApplicationService.Services.CompanyService(
                    CompanyServer.CreateClient()));

            services.AddScoped<IQuizService>(_ =>
                new ApplicationService.Services.QuizService(
                    QuizServer.CreateClient()));

            services.AddScoped<INotificationService>(serviceProvider =>
                new ApplicationService.Services.NotificationService(
                    NotificationServer.CreateClient(),
                    serviceProvider.GetRequiredService<IConfiguration>()));
        });
    }

    public async Task ResetDatabasesAsync()
    {
        await CandidateServer.ResetDatabaseAsync();
        await CompanyServer.ResetDatabaseAsync();
        await NotificationServer.ResetDatabaseAsync();
        await QuizServer.ResetDatabaseAsync();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (!disposing) return;

        CandidateServer.Dispose();
        CompanyServer.Dispose();
        NotificationServer.Dispose();
        QuizServer.Dispose();
        _connection.Dispose();
    }
}

public sealed class CandidateServerFactory : WebApplicationFactory<CandidateProgram>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public CandidateServerFactory()
    {
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<CandidateDbContext>>();
            services.AddDbContext<CandidateDbContext>(options =>
                options.UseSqlite(_connection));
        });
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CandidateDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

public sealed class CompanyServerFactory : WebApplicationFactory<CompanyProgram>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public CompanyServerFactory()
    {
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<CompanyDbContext>>();
            services.AddDbContext<CompanyDbContext>(options =>
                options.UseSqlite(_connection));
            services.RemoveAll<CompanyRealtimePublisher>();
            services.AddSingleton<CompanyRealtimePublisher,
                NoopCompanyRealtimePublisher>();
        });
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CompanyDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

internal sealed class NoopCompanyRealtimePublisher : CompanyRealtimePublisher
{
    public Task PublishAsync<T>(string eventName, T payload) => Task.CompletedTask;
}

public sealed class NotificationServerFactory : WebApplicationFactory<NotificationProgram>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public NotificationServerFactory()
    {
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<NotificationDbContext>>();
            services.AddDbContext<NotificationDbContext>(options =>
                options.UseSqlite(_connection));
        });
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

public sealed class QuizServerFactory : WebApplicationFactory<QuizProgram>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public Guid CurrentJobId { get; private set; }

    public QuizServerFactory()
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

            services.RemoveAll<QuizCompanyService>();
            services.RemoveAll<QuizJobApplicationService>();
            services.RemoveAll<QuizRealtimePublisher>();
            services.AddSingleton<QuizCompanyService, FakeQuizCompanyService>();
            services.AddSingleton<QuizJobApplicationService>(
                new FakeQuizJobApplicationService(this));
            services.AddSingleton<QuizRealtimePublisher, NoopQuizRealtimePublisher>();
        });
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<QuizDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
        CurrentJobId = Guid.Empty;
    }

    public async Task<Guid> SeedQuestionAsync(Guid jobId)
    {
        CurrentJobId = jobId;
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<QuizDbContext>();
        var question = new QuizQuestion
        {
            JobListingId = jobId,
            QuestionText = "Describe your experience with SQL databases.",
            OrderIndex = 1
        };
        db.JobListingQuestions.Add(question);
        await db.SaveChangesAsync();
        return question.Id;
    }

    public async Task<bool> HasAnswerAsync(Guid applicationId, Guid questionId)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<QuizDbContext>();
        return await db.QuizAnswers.AnyAsync(answer =>
            answer.JobApplicationId == applicationId &&
            answer.JobListingQuestionId == questionId);
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

internal sealed class FakeQuizCompanyService : QuizCompanyService
{
    public Task<Guid> GetMyProfileIdAsync(string authorizationHeader) =>
        Task.FromResult(Guid.NewGuid());

    public Task<QuizJobListingDto?> GetJobAsync(Guid jobId) =>
        Task.FromResult<QuizJobListingDto?>(new QuizJobListingDto { Id = jobId });
}

internal sealed class FakeQuizJobApplicationService(
    QuizServerFactory server) : QuizJobApplicationService
{
    public Task<QuizJobApplicationDto?> GetApplicationAsync(
        Guid applicationId,
        string authorizationHeader) =>
        Task.FromResult<QuizJobApplicationDto?>(new QuizJobApplicationDto
        {
            Id = applicationId,
            CandidateProfileId = Guid.NewGuid(),
            JobListingId = server.CurrentJobId
        });
}

internal sealed class NoopQuizRealtimePublisher : QuizRealtimePublisher
{
    public Task PublishAsync<T>(string eventName, T payload) => Task.CompletedTask;
}
