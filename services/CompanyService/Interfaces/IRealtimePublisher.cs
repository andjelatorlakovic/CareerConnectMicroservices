namespace CompanyService.Interfaces;

public interface IRealtimePublisher
{
    Task PublishAsync<T>(string eventName, T payload);
}
