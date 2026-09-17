using MatchingService.Contracts;

namespace MatchingService.Interfaces;

public interface ICandidateService
{
    Task<CandidateProfileDto> GetMyProfileAsync(
        string authorizationHeader);
}