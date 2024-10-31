import { decodePacket } from "engine.io-parser";
import io, { Socket } from "socket.io-client";

import { isMainWorldContext } from "@/utils/utils";

class InternalWebSocketManager {
  private static instance: InternalWebSocketManager;

  private sockets: Map<string, Socket["io"]["engine"]>;

  private constructor() {
    this.sockets = new Map();
  }

  static getInstance(): InternalWebSocketManager {
    if (InternalWebSocketManager.instance == null) {
      InternalWebSocketManager.instance = new InternalWebSocketManager();
    }
    return InternalWebSocketManager.instance;
  }

  public async handShake(id?: string): Promise<Socket["io"]["engine"]> {
    return new Promise((resolve, reject) => {
      if (isMainWorldContext()) throw new Error("Not allowed in main world");

      const socket = io(`www.perplexity.ai/${id ? `?src=${id}` : ""}`, {
        transports: ["polling", "websocket"],
        upgrade: true,
        reconnection: false,
      }).io.engine;

      const messageHandler = (message: unknown) => {
        if (typeof message !== "string") return;

        console.log("message", message);

        const decodedData = decodePacket(message);
        const sid = decodedData.data.match(/^\{"sid":"(.+)"\}$/)?.[1];

        if (decodedData.type === "open" && sid != null) {
          this.sockets.set(sid, socket);
          resolve(socket);
        }

        socket.off("message", messageHandler);
      };

      socket.on("message", messageHandler);

      socket.on("error", (error) => {
        return reject(error);
      });
    });
  }

  public getSocket(sid: string): Socket["io"]["engine"] | undefined {
    return this.sockets.get(sid);
  }

  public removeSocket(sid: string): boolean {
    this.sockets.get(sid)?.close();

    return this.sockets.delete(sid);
  }
}

export default InternalWebSocketManager.getInstance();
