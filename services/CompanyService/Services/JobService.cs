using CompanyService.Data;
using CompanyService.DTOs.JobListing;
using CompanyService.Enums;
using CompanyService.Interfaces;
using CompanyService.Models;
using Microsoft.EntityFrameworkCore;

namespace CompanyService.Services;

public class JobService : IJobService
{
    private readonly CompanyDbContext _context;
    private readonly IRealtimePublisher _realtimePublisher;
    private readonly ILogger<JobService> _logger;

    public JobService(
        CompanyDbContext context,
        IRealtimePublisher realtimePublisher,
        ILogger<JobService> logger)
    {
        _context = context;
        _realtimePublisher = realtimePublisher;
        _logger = logger;
    }
    //Zatvaranje oglasa
    public async Task<bool> CloseAsync(Guid companyProfileId, Guid JobId)
    {
        var job = await _context.JobListings.FirstOrDefaultAsync(j=> j.Id== JobId  &&  j.CompanyProfileId==companyProfileId);
        if(job==null) return false;
        job.Status=JobStatus.Closed;
        await _context.SaveChangesAsync();
        await PublishJobListingsChangedAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid jobId)
    {
        var job = await _context.JobListings
            .FirstOrDefaultAsync(job => job.Id == jobId);

        if (job is null)
        {
            return false;
        }

        _context.JobListings.Remove(job);
        await _context.SaveChangesAsync();
        await PublishJobListingsChangedAsync();
        return true;
    }
    //Kreiranje oglasa 
    public async Task<JobListingDto> CreateAsync(Guid companyProfileId, CreateJobListingRequest request)
    {
        ValidateJobRequest(request.ExpiresAt, request.SalaryMin, request.SalaryMax);

        var job = new JobListing
        {
            CompanyProfileId =companyProfileId,
            Title= request.Title,
            Description= request.Description,
            Location = request.Location,
            ExperienceLevel=request.ExperienceLevel,
            JobCategory = request.JobCategory,
            ExpiresAt = request.ExpiresAt,
            JobSkills = request.Skills.Select(s=>new JobSkill{Skill = s}).ToList(),
            EmploymentType= request.EmploymentType,
            SalaryMin= request.SalaryMin,
            SalaryMax = request.SalaryMax
        };
        _context.JobListings.Add(job);
        await _context.SaveChangesAsync();
        await PublishJobListingsChangedAsync();
        return  MapToDto(job);
    }
    public async Task<List<JobListingDto>> GetAllAsync(string? location, ExperienceLevel? experienceLevel, List<Skill> skills)
    {
        var query = _context.JobListings
        .Include(j=>j.JobSkills)
        .Where(j =>
            j.Status == JobStatus.Active &&
            j.ExpiresAt > DateTime.UtcNow);
        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(j=> j.Location.ToLower().Contains(location.ToLower()));
        }
        if (experienceLevel.HasValue)
        {
            query = query.Where(j=> j.ExperienceLevel==experienceLevel);
        }
        if(skills!=null && skills.Any())
        {
            query = query.Where(j=> skills.All(s=> j.JobSkills.Any(js=> js.Skill==s)));
        }
        var jobs = await query.ToListAsync();
        return jobs.Select(MapToDto).ToList();
    }
    //Pronadji po kompaniji
    public async Task<List<JobListingDto>> GetByCompanyAsync(Guid companyProfileId)
    {
        var jobs = await _context.JobListings
        .Include(j=> j.JobSkills)
        .Where(j=> j.CompanyProfileId==companyProfileId)
        .ToListAsync();
        return jobs.Select(MapToDto).ToList();
    }

    public async Task<JobListingDto> GetByIdAsync(Guid jobId)
    {
        var job = await _context.JobListings
        .Include(j=> j.JobSkills)
        .FirstOrDefaultAsync(j=> j.Id==jobId) 
        ?? throw new InvalidOperationException("Job  not found.");
        return MapToDto(job);
    }

    public async Task<JobListingDto> UpdateAsync(Guid companyProfileId,Guid jobId, UpdateJobListingRequest request)
    {
        ValidateJobRequest(request.ExpiresAt, request.SalaryMin, request.SalaryMax);

        var job = await _context.JobListings
        .Include(j=>j.JobSkills)
        .FirstOrDefaultAsync(j=>j.CompanyProfileId==companyProfileId && j.Id==jobId) ?? throw new InvalidOperationException("Job for update not found");

        job.Title= request.Title;
        job.Description=request.Description;
        job.Location=request.Location;
        job.ExperienceLevel=request.ExperienceLevel;
        job.JobCategory=request.JobCategory;
        job.ExpiresAt=request.ExpiresAt;
        job.EmploymentType=request.EmploymentType;
        job.SalaryMin=request.SalaryMin;
        job.SalaryMax= request.SalaryMax;

        _context.JobSkills.RemoveRange(job.JobSkills);
        job.JobSkills = request.Skills
            .Distinct()
            .Select(skill => new JobSkill { Skill = skill })
            .ToList();

        await _context.SaveChangesAsync();
        await PublishJobListingsChangedAsync();
        return MapToDto(job);
    }

    public async Task<bool> UpdateExpiresAtasync(Guid companyProfileId, Guid jobId, DateTime expiresAt)
    {
        if (expiresAt.Date < DateTime.UtcNow.Date)
        {
            throw new ArgumentException("The expiration date cannot be in the past.");
        }

        var job = await _context.JobListings
        .FirstOrDefaultAsync(j=>j.CompanyProfileId==companyProfileId && j.Id==jobId);

        if(job==null) return false;
        job.ExpiresAt=expiresAt;

        await _context.SaveChangesAsync();
        await PublishJobListingsChangedAsync();
        return true;
    }
    public async Task<List<JobListingDto>> GetByUserAsync(Guid userId)
    {
        var companyProfile = await _context.CompanyProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(profile => profile.UserId == userId);

        if (companyProfile == null)
        {
            return new List<JobListingDto>();
        }

        return await GetByCompanyAsync(companyProfile.Id);
    }
    private static JobListingDto MapToDto(JobListing job)=> new()
    {
        Id = job.Id,
        CompanyProfileId = job.CompanyProfileId,
        Title = job.Title,
        Description = job.Description,
        Location = job.Location,
        ExperienceLevel = job.ExperienceLevel,
        JobCategory = job.JobCategory,
        Status = job.Status,
        CreatedAt = job.CreatedAt,
        ExpiresAt = job.ExpiresAt,
        Skills = job.JobSkills.Select(s=> s.Skill).ToList(),
        EmploymentType= job.EmploymentType,
        SalaryMin= job.SalaryMin,
        SalaryMax = job.SalaryMax
    };

    private static void ValidateJobRequest(
        DateTime expiresAt,
        decimal? salaryMin,
        decimal? salaryMax)
    {
        if (expiresAt.Date < DateTime.UtcNow.Date)
        {
            throw new ArgumentException("The expiration date cannot be in the past.");
        }

        if (salaryMin.HasValue && salaryMax.HasValue && salaryMin > salaryMax)
        {
            throw new ArgumentException("Minimum salary cannot exceed maximum salary.");
        }
    }

    private async Task PublishJobListingsChangedAsync()
    {
        try
        {
            await _realtimePublisher.PublishAsync(
                "JobListingsChanged",
                new { });
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "The JobListingsChanged real-time event could not be published.");
        }
    }
}
