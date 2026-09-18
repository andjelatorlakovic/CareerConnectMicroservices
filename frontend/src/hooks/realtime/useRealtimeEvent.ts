import { useEffect } from 'react';

import { realtimeService } from '../../api_services/signalr/RealtimeService';
import { useAuth } from '../auth/useAuth';

export function useRealtimeEvent<T>(
  eventName: string,
  handler: (payload: T) => void
) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    return realtimeService.subscribe(user.token, eventName, handler);
  }, [eventName, handler, user]);
}
