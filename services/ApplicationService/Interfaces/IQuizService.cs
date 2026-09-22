using ApplicationService.DTOs;

namespace ApplicationService.Interfaces;

public interface IQuizService
{
    Task<List<JobListingQuestionDto>> GetQuestionsAsync(
        Guid jobId,
        string authorizationHeader);

    Task SaveAnswersAsync(
        Guid applicationId,
        List<SubmitAnswerRequest> answers,
        string authorizationHeader);
}
