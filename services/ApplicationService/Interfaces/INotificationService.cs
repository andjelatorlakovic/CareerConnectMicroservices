using ApplicationService.Contracts;

namespace ApplicationService.Interfaces;

public interface INotificationService
{
    Task CreateAsync(CreateNotificationRequest request);
    Task PublishRealtimeEventAsync<T>(string eventName, T payload);
}
