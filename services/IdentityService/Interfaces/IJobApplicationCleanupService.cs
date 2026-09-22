namespace IdentityService.Interfaces;

public interface IJobApplicationCleanupService
{
    Task DeleteApplicationsForJobAsync(Guid jobId);
}
