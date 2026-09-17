using ApplicationService.Contracts;

namespace ApplicationService.Interfaces;

public interface INotificationService
{
    Task CreateAsync(CreateNotificationRequest request);
}
