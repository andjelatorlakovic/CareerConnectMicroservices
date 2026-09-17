using Microsoft.EntityFrameworkCore;
using QuizService.Data;
using QuizService.DTOs;
using QuizService.Interfaces;
using QuizService.Models;

namespace QuizService.Services;

public class QuizService : IQuizService
{
    private readonly QuizDbContext _context;
    private readonly ICompanyService _companyService;
    private readonly IJobApplicationService _jobApplicationService;

    public QuizService(
        QuizDbContext context,
        ICompanyService companyService,
        IJobApplicationService jobApplicationService)
    {
        _context = context;
        _companyService = companyService;
        _jobApplicationService = jobApplicationService;
    }

    public async Task<JobListingQuestionDto> AddQuestionAsync(
        Guid companyProfileId,
        Guid jobId,
        AddQuestionRequest request)
    {
        await EnsureJobBelongsToCompanyAsync(companyProfileId, jobId);

        var question = new JobListingQuestion
        {
            JobListingId = jobId,
            QuestionText = request.QuestionText.Trim(),
            OrderIndex = request.OrderIndex
        };

        _context.JobListingQuestions.Add(question);
        await _context.SaveChangesAsync();

        return MapToDto(question);
    }

    public async Task<List<QuizAnswerDto>> GetAnswersForApplicationAsync(
        Guid companyProfileId,
        Guid applicationId,
        string authorizationHeader)
    {
        var application = await GetApplicationOrThrowAsync(
            applicationId,
            authorizationHeader);
        await EnsureJobBelongsToCompanyAsync(
            companyProfileId,
            application.JobListingId);

        return await _context.QuizAnswers
            .Where(answer => answer.JobApplicationId == applicationId)
            .Join(
                _context.JobListingQuestions,
                answer => answer.JobListingQuestionId,
                question => question.Id,
                (answer, question) => new QuizAnswerDto
                {
                    QuestionId = question.Id,
                    Question = question.QuestionText,
                    Answer = answer.Answer
                })
            .ToListAsync();
    }

    public async Task<List<JobListingQuestionDto>> GetQuestionsAsync(Guid jobId)
    {
        var questions = await _context.JobListingQuestions
            .Where(question => question.JobListingId == jobId)
            .OrderBy(question => question.OrderIndex)
            .ToListAsync();

        return questions.Select(MapToDto).ToList();
    }

    public async Task<bool> RemoveQuestionAsync(
        Guid companyProfileId,
        Guid jobId,
        Guid questionId)
    {
        await EnsureJobBelongsToCompanyAsync(companyProfileId, jobId);

        var question = await _context.JobListingQuestions
            .FirstOrDefaultAsync(item =>
                item.Id == questionId && item.JobListingId == jobId);

        if (question is null)
        {
            return false;
        }

        _context.JobListingQuestions.Remove(question);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task SaveAnswersAsync(
        Guid applicationId,
        List<SubmitAnswerRequest> answers,
        string authorizationHeader)
    {
        var application = await GetApplicationOrThrowAsync(
            applicationId,
            authorizationHeader);

        var requestedQuestionIds = answers
            .Select(answer => answer.QuestionId)
            .Distinct()
            .ToList();

        if (requestedQuestionIds.Count != answers.Count)
        {
            throw new InvalidOperationException(
                "Each question can be answered only once.");
        }

        var validQuestionIds = await _context.JobListingQuestions
            .Where(question =>
                question.JobListingId == application.JobListingId &&
                requestedQuestionIds.Contains(question.Id))
            .Select(question => question.Id)
            .ToListAsync();

        if (validQuestionIds.Count != requestedQuestionIds.Count)
        {
            throw new InvalidOperationException(
                "One or more questions do not belong to this job.");
        }

        var alreadyAnswered = await _context.QuizAnswers
            .AnyAsync(answer =>
                answer.JobApplicationId == applicationId &&
                requestedQuestionIds.Contains(answer.JobListingQuestionId));

        if (alreadyAnswered)
        {
            throw new InvalidOperationException(
                "Answers for this application have already been submitted.");
        }

        var quizAnswers = answers.Select(answer => new QuizAnswer
        {
            JobApplicationId = applicationId,
            JobListingQuestionId = answer.QuestionId,
            Answer = answer.Answer.Trim()
        });

        _context.QuizAnswers.AddRange(quizAnswers);
        await _context.SaveChangesAsync();
    }

    private async Task EnsureJobBelongsToCompanyAsync(
        Guid companyProfileId,
        Guid jobId)
    {
        var job = await _companyService.GetJobAsync(jobId);

        if (job is null || job.CompanyProfileId != companyProfileId)
        {
            throw new InvalidOperationException(
                "Job does not belong to this company.");
        }
    }

    private async Task<Contracts.JobApplicationDto> GetApplicationOrThrowAsync(
        Guid applicationId,
        string authorizationHeader)
    {
        return await _jobApplicationService.GetApplicationAsync(
                applicationId,
                authorizationHeader)
            ?? throw new InvalidOperationException("Application not found.");
    }

    private static JobListingQuestionDto MapToDto(
        JobListingQuestion question) => new()
    {
        Id = question.Id,
        QuestionText = question.QuestionText,
        OrderIndex = question.OrderIndex
    };
}
