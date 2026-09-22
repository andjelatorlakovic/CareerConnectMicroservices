namespace IdentityService.Interfaces;

public interface IAdminJobDeletionService
{
    Task DeleteAsync(Guid jobId);
}
