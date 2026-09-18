export type RealtimeHandler<T> = (payload: T) => void;

export interface IRealtimeService {
  subscribe<T>(
    token: string,
    eventName: string,
    handler: RealtimeHandler<T>
  ): () => void;
}
