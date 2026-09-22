using QuizService.DTOs;

namespace QuizService.Interfaces;

public interface IQuizService
{
    Task <JobListingQuestionDto> AddQuestionAsync(Guid companyProfileId,Guid jobId, AddQuestionRequest request);
    Task<bool> RemoveQuestionAsync(Guid companyProfileId, Guid jobId, Guid questionId);
    Task DeleteByJobAsync(Guid jobId);
     Task<List<JobListingQuestionDto>> GetQuestionsAsync(Guid jobId);
    Task<List<QuizAnswerDto>> GetAnswersForApplicationAsync(
        Guid companyProfileId,
        Guid applicationId,
        string authorizationHeader);
    Task SaveAnswersAsync(
        Guid applicationId,
        List<SubmitAnswerRequest> answers,
        string authorizationHeader);
}
