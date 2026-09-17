using ApplicationService.DTOs;

namespace ApplicationService.Interfaces;
public interface IJobApplicationService
{
    Task <JobApplicationDto> ApplyJobApplicationAsync(Guid candidateProfileId, Guid jobListingIg, CreateJobApplicationRequest request);
    Task<JobApplicationDto> UpdateStatusAsync(Guid companyProfileId, Guid applicationId, UpdateJobApplicationRequest request);
    Task <List<JobApplicationDto>> GetMyApplicationsAsync(Guid candidateProfileId);
    Task<List<JobApplicationDto>> GetByJobAsync( Guid companyProfileId, Guid jobId);
}
