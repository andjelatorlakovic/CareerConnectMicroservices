using QuizService.Contracts;

namespace QuizService.Interfaces;

public interface ICompanyService
{
    Task<Guid> GetMyProfileIdAsync(string authorizationHeader);
    Task<JobListingDto?> GetJobAsync(Guid jobId);
}
