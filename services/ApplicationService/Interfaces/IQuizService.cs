using ApplicationService.DTOs;

namespace ApplicationService.Interfaces;

public interface IQuizService
{
    Task SaveAnswersAsync(
        Guid applicationId,
        List<SubmitAnswerRequest> answers,
        string authorizationHeader);
}
