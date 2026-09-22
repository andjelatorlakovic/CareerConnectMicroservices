using CompanyService.Data;
using CompanyService.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace CompanyService.IntegrationTests;

public sealed class CompanyApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public CompanyApiFactory()
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

            services.RemoveAll<IRealtimePublisher>();
            services.AddSingleton<IRealtimePublisher, NoopRealtimePublisher>();
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

internal sealed class NoopRealtimePublisher : IRealtimePublisher
{
    public Task PublishAsync<T>(string eventName, T payload) => Task.CompletedTask;
}
