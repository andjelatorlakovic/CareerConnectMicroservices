using MatchingService.Contracts;

namespace MatchingService.Interfaces;

public interface ICompanyService
{
    Task<List<JobListingDto>> GetJobsAsync(
        string authorizationHeader);
}
