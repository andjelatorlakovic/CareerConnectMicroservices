using QuizService.Contracts;

namespace QuizService.Interfaces;

public interface IJobApplicationService
{
    Task<JobApplicationDto?> GetApplicationAsync(
        Guid applicationId,
        string authorizationHeader);
}
