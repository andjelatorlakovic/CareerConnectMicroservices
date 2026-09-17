using CompanyService.Models;
using Microsoft.EntityFrameworkCore;

namespace CompanyService.Data;

public class CompanyDbContext : DbContext
{
    public CompanyDbContext(
        DbContextOptions<CompanyDbContext> options)
        : base(options)
    {
    }

    public DbSet<CompanyProfile> CompanyProfiles =>
        Set<CompanyProfile>();

    public DbSet<JobListing> JobListings =>
        Set<JobListing>();

    public DbSet<JobSkill> JobSkills =>
        Set<JobSkill>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<CompanyProfile>()
            .HasIndex(company => company.UserId)
            .IsUnique();

        modelBuilder.Entity<JobListing>()
            .HasOne<CompanyProfile>()
            .WithMany()
            .HasForeignKey(job => job.CompanyProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<JobSkill>()
            .HasKey(skill => new
            {
                skill.JobListingId,
                skill.Skill
            });

        modelBuilder.Entity<JobSkill>()
            .HasOne<JobListing>()
            .WithMany(job => job.JobSkills)
            .HasForeignKey(skill => skill.JobListingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}