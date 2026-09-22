using ApplicationService.Data;
using ApplicationService.DTOs;
using ApplicationService.Enums;
using ApplicationService.Interfaces;
using ApplicationService.Models;
using Microsoft.EntityFrameworkCore;

namespace ApplicationService.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly ApplicationDbContext _context;
    private readonly ICompanyService _companyService;
    private readonly ICandidateService _candidateService;
    private readonly INotificationService _notificationService;
    private readonly IQuizService _quizService;
    private readonly ILogger<JobApplicationService> _logger;

    public JobApplicationService(
        ApplicationDbContext context,
        ICompanyService companyService,
        ICandidateService candidateService,
        INotificationService notificationService,
        IQuizService quizService,
        ILogger<JobApplicationService> logger)
    {
        _context = context;
        _companyService = companyService;
        _candidateService = candidateService;
        _notificationService = notificationService;
        _quizService = quizService;
        _logger = logger;
    }

    public async Task<JobApplicationDto> ApplyJobApplicationAsync(
        Guid candidateProfileId,
        Guid jobListingId,
        CreateJobApplicationRequest request,
        string authorizationHeader)
    {
        var job = await _companyService.GetJobAsync(jobListingId);

        if (job is null ||
            job.ExpiresAt <= DateTime.UtcNow ||
            string.Equals(job.Status, "Closed", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Job listing is not available.");
        }

        var alreadyApplied = await _context.JobApplications.AnyAsync(
            application => application.CandidateProfileId == candidateProfileId &&
                           application.JobListingId == jobListingId);

        if (alreadyApplied)
        {
            throw new InvalidOperationException(
                "You already applied for this job.");
        }

        var questions = await _quizService.GetQuestionsAsync(
            jobListingId,
            authorizationHeader);

        var answeredQuestionIds = request.Answers
            .Where(answer => !string.IsNullOrWhiteSpace(answer.Answer))
            .Select(answer => answer.QuestionId)
            .ToHashSet();

        if (questions.Any(question =>
                !answeredQuestionIds.Contains(question.Id)))
        {
            throw new InvalidOperationException(
                "Please answer all company questions before submitting your application.");
        }

        var application = new JobApplication
        {
            CandidateProfileId = candidateProfileId,
            JobListingId = jobListingId,
            CoverLetter = request.CoverLetter,
            Status = ApplicationStatus.Pending,
            AppliedAt = DateTime.UtcNow
        };

        _context.JobApplications.Add(application);
        await _context.SaveChangesAsync();

        if (request.Answers.Any())
        {
            await _quizService.SaveAnswersAsync(
                application.Id,
                request.Answers,
                authorizationHeader);
        }

        var dto = MapToDto(application);
        await PublishRealtimeEventSafelyAsync(
            "JobApplicationsChanged",
            application.JobListingId.ToString());

        return dto;
    }

    public async Task<List<JobApplicationDto>> GetMyApplicationsAsync(
        Guid candidateProfileId)
    {
        var applications = await _context.JobApplications
            .Where(application =>
                application.CandidateProfileId == candidateProfileId)
            .OrderByDescending(application => application.AppliedAt)
            .ToListAsync();

        return applications.Select(MapToDto).ToList();
    }

    public async Task DeleteByJobAsync(Guid jobId)
    {
        var applications = await _context.JobApplications
            .Where(application => application.JobListingId == jobId)
            .ToListAsync();

        if (applications.Count == 0)
        {
            return;
        }

        _context.JobApplications.RemoveRange(applications);
        await _context.SaveChangesAsync();
        await PublishRealtimeEventSafelyAsync(
            "JobApplicationsChanged",
            jobId.ToString());
    }

    public async Task<List<JobApplicationDto>> GetByJobAsync(
        Guid companyProfileId,
        Guid jobId)
    {
        await EnsureJobBelongsToCompanyAsync(companyProfileId, jobId);

        var applications = await _context.JobApplications
            .Where(application => application.JobListingId == jobId)
            .OrderByDescending(application => application.AppliedAt)
            .ToListAsync();

        return applications.Select(MapToDto).ToList();
    }

    public async Task<JobApplicationDto> GetByIdAsync(
        Guid companyProfileId,
        Guid applicationId)
    {
        var application = await _context.JobApplications
            .FirstOrDefaultAsync(item => item.Id == applicationId)
            ?? throw new InvalidOperationException("Application not found.");

        await EnsureJobBelongsToCompanyAsync(
            companyProfileId,
            application.JobListingId);

        return MapToDto(application);
    }

    public async Task<JobApplicationDto> GetByCandidateAsync(
        Guid candidateProfileId,
        Guid applicationId)
    {
        var application = await _context.JobApplications
            .FirstOrDefaultAsync(item =>
                item.Id == applicationId &&
                item.CandidateProfileId == candidateProfileId)
            ?? throw new InvalidOperationException("Application not found.");

        return MapToDto(application);
    }

    public async Task<JobApplicationDto> UpdateStatusAsync(
        Guid companyProfileId,
        Guid applicationId,
        UpdateJobApplicationRequest request)
    {
        var application = await _context.JobApplications
            .FirstOrDefaultAsync(item => item.Id == applicationId)
            ?? throw new InvalidOperationException("Application not found.");

        await EnsureJobBelongsToCompanyAsync(
            companyProfileId,
            application.JobListingId);

        var previousStatus = application.Status;
        application.Status = request.Status;
        await _context.SaveChangesAsync();

        if (previousStatus != application.Status)
        {
            await NotifyCandidateAboutStatusChangeAsync(application);
            await PublishRealtimeEventSafelyAsync(
                "ApplicationStatusChanged",
                MapToDto(application));
        }

        return MapToDto(application);
    }

    private async Task NotifyCandidateAboutStatusChangeAsync(
        JobApplication application)
    {
        try
        {
            var candidateUserId = await _candidateService
                .GetUserIdByProfileIdAsync(application.CandidateProfileId);

            await _notificationService.CreateAsync(
                new Contracts.CreateNotificationRequest
                {
                    UserId = candidateUserId,
                    JobListingId = application.JobListingId,
                    Message =
                        $"Your application status has been updated to {application.Status}."
                });
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "The application status was updated, but the notification could not be sent for application {ApplicationId}.",
                application.Id);
        }
    }

    private async Task PublishRealtimeEventSafelyAsync<T>(
        string eventName,
        T payload)
    {
        try
        {
            await _notificationService.PublishRealtimeEventAsync(
                eventName,
                payload);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "The {EventName} real-time event could not be published.",
                eventName);
        }
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

    private static JobApplicationDto MapToDto(JobApplication application) => new()
    {
        Id = application.Id,
        CandidateProfileId = application.CandidateProfileId,
        JobListingId = application.JobListingId,
        CoverLetter = application.CoverLetter,
        Status = application.Status,
        AppliedAt = application.AppliedAt
    };
}
