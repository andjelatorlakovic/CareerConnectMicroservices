
using CompanyService.DTOs.JobListing;
using CompanyService.Enums;

namespace CompanyService.Interfaces;
public interface IJobService
{
    Task<JobListingDto> CreateAsync(Guid companyProfileId, CreateJobListingRequest request);
    Task<JobListingDto> UpdateAsync(Guid companyProfileId,Guid jobId, UpdateJobListingRequest request);
    Task<bool> CloseAsync(Guid companyProfileId, Guid JobId);
    Task<bool> UpdateExpiresAtasync(Guid companyProfileId, Guid jobId, DateTime expiresAt);
    Task<List<JobListingDto>> GetAllAsync(string? location, ExperienceLevel? experienceLevel,List<Skill> skills);
    Task<JobListingDto> GetByIdAsync(Guid jobId);
    Task<List<JobListingDto>> GetByCompanyAsync(Guid companyProfileId);
    Task<List<JobListingDto>> GetByUserAsync(Guid userId);
}
