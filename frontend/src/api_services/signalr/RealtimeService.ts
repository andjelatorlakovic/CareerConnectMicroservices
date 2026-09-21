import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr';
import type {
  IRealtimeService,
  RealtimeHandler,
} from './IRealtimeService';

const hubUrl = `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}/hubs/realtime`;

let connection: HubConnection | null = null;
let connectionToken: string | null = null;
let subscriberCount = 0;
let connectionStartPromise: Promise<void> | null = null;

async function getConnection(token: string) {
  if (connection && connectionToken !== token) {
    await connection.stop();
    connection = null;
    connectionStartPromise = null;
  }

  if (!connection) {
    connectionToken = token;
    connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
  }

  if (connection.state === HubConnectionState.Disconnected) {
    connectionStartPromise ??= connection
      .start()
      .finally(() => {
        connectionStartPromise = null;
      });
  }

  if (connectionStartPromise) {
    await connectionStartPromise;
  }

  return connection;
}

export const realtimeService: IRealtimeService = {
  subscribe<T>(
    token: string,
    eventName: string,
    handler: RealtimeHandler<T>
  ) {
    let disposed = false;
    let activeConnection: HubConnection | null = null;

    subscriberCount += 1;

    void getConnection(token)
      .then((currentConnection) => {
        if (disposed) return;

        activeConnection = currentConnection;
        currentConnection.on(eventName, handler);
      })
      .catch((error: unknown) => {
        console.error('SignalR konekcija nije uspostavljena.', error);
      });

    return () => {
      disposed = true;
      subscriberCount -= 1;

      if (activeConnection) {
        activeConnection.off(eventName, handler);
      }

      const connectionToStop = connection;

      window.setTimeout(() => {
        if (subscriberCount !== 0 || !connectionToStop ||
            connection !== connectionToStop) {
          return;
        }

        void connectionToStop.stop().finally(() => {
          if (connection === connectionToStop) {
            connection = null;
            connectionToken = null;
            connectionStartPromise = null;
          }
        });
      }, 0);
    };
  },
};
