using IdentityService.Enums;
using IdentityService.Models;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Data;

public static class IdentityDatabaseSeeder
{
    public static async Task SeedAdminAsync(
        IServiceProvider services,
        IConfiguration configuration)
    {
        if (!configuration.GetValue<bool>("SeedAdmin:Enabled"))
        {
            return;
        }

        var email = configuration["SeedAdmin:Email"]?.Trim();
        var password = configuration["SeedAdmin:Password"];

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Seed admin email and password must be configured.");
        }

        var context = services.GetRequiredService<IdentityDbContext>();
        var exists = await context.Users.AnyAsync(user => user.Email == email);

        if (exists)
        {
            return;
        }

        context.Users.Add(new User(
            "System",
            "Administrator",
            email,
            BCrypt.Net.BCrypt.HashPassword(password),
            UserRole.Admin,
            isActive: true));

        await context.SaveChangesAsync();
    }
}
