namespace ApplicationService.Interfaces;

public interface ICandidateService
{
    Task<Guid> GetMyProfileIdAsync(string authorizationHeader);
    Task<Guid> GetUserIdByProfileIdAsync(Guid candidateProfileId);
}
