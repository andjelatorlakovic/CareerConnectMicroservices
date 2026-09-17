using QuizService.Models;
using Microsoft.EntityFrameworkCore;

namespace QuizService.Data;

public class QuizDbContext : DbContext
{
    public QuizDbContext(DbContextOptions<QuizDbContext> options)
        : base(options)
    {
    }

    public DbSet<JobListingQuestion> JobListingQuestions =>
        Set<JobListingQuestion>();

    public DbSet<QuizAnswer> QuizAnswers => Set<QuizAnswer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<JobListingQuestion>()
            .HasIndex(question => new
            {
                question.JobListingId,
                question.OrderIndex
            })
            .IsUnique();

        modelBuilder.Entity<QuizAnswer>()
            .HasIndex(answer => new
            {
                answer.JobApplicationId,
                answer.JobListingQuestionId
            })
            .IsUnique();

        modelBuilder.Entity<QuizAnswer>()
            .HasOne<JobListingQuestion>()
            .WithMany()
            .HasForeignKey(answer => answer.JobListingQuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
