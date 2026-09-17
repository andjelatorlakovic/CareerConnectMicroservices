using ApplicationService.Contracts;

namespace ApplicationService.Interfaces;

public interface ICompanyService
{
    Task<Guid> GetMyProfileIdAsync(string authorizationHeader);
    Task<JobListingDto?> GetJobAsync(Guid jobId);
}
