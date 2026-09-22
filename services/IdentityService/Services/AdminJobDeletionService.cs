using IdentityService.Interfaces;

namespace IdentityService.Services;

public class AdminJobDeletionService(
    IJobApplicationCleanupService jobApplicationCleanupService,
    IQuizCleanupService quizCleanupService,
    ICompanyJobService companyJobService) : IAdminJobDeletionService
{
    public async Task DeleteAsync(Guid jobId)
    {
        await jobApplicationCleanupService.DeleteApplicationsForJobAsync(jobId);
        await quizCleanupService.DeleteQuizDataForJobAsync(jobId);
        await companyJobService.DeleteJobListingAsync(jobId);
    }
}
