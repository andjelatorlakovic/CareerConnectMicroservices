using CandidateService.Models;
using Microsoft.EntityFrameworkCore;

namespace CandidateService.Data;

public class CandidateDbContext : DbContext
{
    public CandidateDbContext(
        DbContextOptions<CandidateDbContext> options)
        : base(options)
    {
    }

    public DbSet<CandidateProfile> CandidateProfiles => Set<CandidateProfile>();
    public DbSet<Education> Educations => Set<Education>();
    public DbSet<WorkExperience> WorkExperiences => Set<WorkExperience>();
    public DbSet<CandidateSkill> CandidateSkills => Set<CandidateSkill>();
    public DbSet<CandidateDesiredJobCategory> CandidateDesiredJobCategories =>
        Set<CandidateDesiredJobCategory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<CandidateProfile>()
            .HasIndex(profile => profile.UserId)
            .IsUnique();

        modelBuilder.Entity<Education>()
            .HasOne<CandidateProfile>()
            .WithMany(profile => profile.Education)
            .HasForeignKey(education => education.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkExperience>()
            .HasOne<CandidateProfile>()
            .WithMany(profile => profile.WorkExperience)
            .HasForeignKey(experience => experience.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CandidateSkill>()
            .HasKey(skill => new { skill.CandidateProfileId, skill.Skill });

        modelBuilder.Entity<CandidateSkill>()
            .HasOne<CandidateProfile>()
            .WithMany(profile => profile.Skills)
            .HasForeignKey(skill => skill.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CandidateDesiredJobCategory>()
            .HasKey(category => new
            {
                category.CandidateProfileId,
                category.JobCategory
            });

        modelBuilder.Entity<CandidateDesiredJobCategory>()
            .HasOne<CandidateProfile>()
            .WithMany(profile => profile.DesiredJobCategories)
            .HasForeignKey(category => category.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
