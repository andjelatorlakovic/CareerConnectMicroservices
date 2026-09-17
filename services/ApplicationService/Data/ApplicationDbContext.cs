using ApplicationService.Models;
using Microsoft.EntityFrameworkCore;

namespace ApplicationService.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<JobApplication>()
            .HasIndex(application => new
            {
                application.CandidateProfileId,
                application.JobListingId
            })
            .IsUnique();
    }
}
