import { Nullable } from './Utils';
import {
  MessageListener,
  SendMessage,
} from './WebpageMessenger';

declare global {
  interface Window {
    next?: {
      router: {
        push: (url: string, as?: string, options?: any) => Promise<boolean>;
        replace: (url: string, as?: string, options?: any) => Promise<boolean>;
        events: {
          on: (event: string, callback: () => void) => void;
          off: (event: string, callback: () => void) => void;
        };
      };
    };

    Messenger: {
      onMessage: MessageListener;
      sendMessage: SendMessage;
    };

    capturedSocket: Nullable<WebSocket | XMLHttpRequest>;
    longPollingInstance: Nullable<XMLHttpRequest>;
  }
}
