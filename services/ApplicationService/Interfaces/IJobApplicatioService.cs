using ApplicationService.DTOs;

namespace ApplicationService.Interfaces;
public interface IJobApplicationService
{
    Task <JobApplicationDto> ApplyJobApplicationAsync(
        Guid candidateProfileId,
        Guid jobListingIg,
        CreateJobApplicationRequest request,
        string authorizationHeader);
    Task<JobApplicationDto> UpdateStatusAsync(Guid companyProfileId, Guid applicationId, UpdateJobApplicationRequest request);
    Task <List<JobApplicationDto>> GetMyApplicationsAsync(Guid candidateProfileId);
    Task<List<JobApplicationDto>> GetByJobAsync( Guid companyProfileId, Guid jobId);
    Task<JobApplicationDto> GetByIdAsync(
        Guid companyProfileId,
        Guid applicationId);
    Task<JobApplicationDto> GetByCandidateAsync(
        Guid candidateProfileId,
        Guid applicationId);
}
