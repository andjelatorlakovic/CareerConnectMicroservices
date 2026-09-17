using MatchingService.DTOs;

namespace MatchingService.Interfaces;

public interface IMatchingService
{
    Task<List<MatchResultDto>> GetMatchingJobsAsync(
        string authorizationHeader);
}
