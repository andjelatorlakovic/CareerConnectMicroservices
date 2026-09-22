namespace IdentityService.Interfaces;

public interface IQuizCleanupService
{
    Task DeleteQuizDataForJobAsync(Guid jobId);
}
