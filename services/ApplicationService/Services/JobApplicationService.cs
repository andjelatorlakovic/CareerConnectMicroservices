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

    public JobApplicationService(
        ApplicationDbContext context,
        ICompanyService companyService)
    {
        _context = context;
        _companyService = companyService;
    }

    public async Task<JobApplicationDto> ApplyJobApplicationAsync(
        Guid candidateProfileId,
        Guid jobListingId,
        CreateJobApplicationRequest request)
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

        return MapToDto(application);
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

        application.Status = request.Status;
        await _context.SaveChangesAsync();

        return MapToDto(application);
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
