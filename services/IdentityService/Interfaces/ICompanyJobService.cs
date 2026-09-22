namespace IdentityService.Interfaces;

public interface ICompanyJobService
{
    Task DeleteJobListingAsync(Guid jobId);
}
