import { Socket } from "socket.io-client";
import { z } from "zod";

import InternalWebSocketManager from "@/utils/InternalWebSocketManager";
import WsMessageParser from "@/utils/WsMessageParser";

export const TTS_VOICES = ["Mike", "Alex", "Kate", "Mary"] as const;
export const TtsVoiceSchema = z.enum(TTS_VOICES);
export type TtsVoice = z.infer<typeof TtsVoiceSchema>;

class TTSPlayer {
  private static instance: TTSPlayer;
  private audioContext: AudioContext | null = null;
  private audioQueue: Int16Array[] = [];
  private currentSource: AudioBufferSourceNode | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private socket: Socket["io"]["engine"] | null = null;
  private isPlaying = false;
  private currentResolve: (() => void) | null = null;

  private static readonly AUDIO_NORMALIZATION_FACTOR = 32768.0;

  private constructor() {}

  static getInstance(): TTSPlayer {
    if (TTSPlayer.instance == null) {
      TTSPlayer.instance = new TTSPlayer();
    }
    return TTSPlayer.instance;
  }

  private cleanup(): void {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioQueue.length = 0;
  }

  async play({
    uuid,
    voice,
  }: {
    uuid: string;
    voice: TtsVoice;
  }): Promise<void> {
    if (this.isPlaying) {
      await this.stop();
    }

    if (!this.socket || this.socket.readyState === "closed") {
      this.socket = await InternalWebSocketManager.handShake();
    }

    return new Promise<void>((resolve) => {
      this.currentResolve = resolve;
      this.setupSocketListeners();
      this.sendTTSRequest({ uuid, voice });
    });
  }

  private setupSocketListeners(): void {
    this.socket?.on("message", (message: unknown) => {
      this.handleMessage(message);
    });
  }

  private sendTTSRequest({
    uuid,
    voice,
  }: {
    uuid: string;
    voice: TtsVoice;
  }): void {
    this.socket?.send(
      WsMessageParser.stringify({
        messageCode: 222,
        event: "voice_over",
        data: [
          {
            is_page: false,
            version: "2.13",
            completed: true,
            uuid,
            preset: voice,
            voice_over_language: "en",
          },
        ],
      }),
    );
  }

  private async handleMessage(message: unknown): Promise<void> {
    if (message instanceof ArrayBuffer) {
      this.handleAudioChunk(message);
    } else if (
      typeof message === "string" &&
      message.includes('"status":"completed","state":"DONE"')
    ) {
      this.stopListening();
    }
  }

  private handleAudioChunk(arrayBuffer: ArrayBuffer): void {
    try {
      const view = new Int16Array(arrayBuffer);
      this.audioQueue.push(view);

      if (!this.isPlaying) {
        this.isPlaying = true;
        this.playNextChunk();
      }

      this.resetTimeout();
    } catch (error) {
      console.error("Error processing audio message:", error);
    }
  }

  private resetTimeout(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.stopListening(), 5000);
  }

  private stopListening(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.socket?.off("message");
  }

  async stop(): Promise<void> {
    if (this.isPlaying) {
      this.socket?.close();
      this.isPlaying = false;
    }
    if (this.currentResolve) {
      this.currentResolve(); // Resolve the promise when stopping
      this.currentResolve = null;
    }
    this.cleanup();
    this.stopListening();
  }

  private async playNextChunk(): Promise<void> {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.cleanup();
      if (this.currentResolve) {
        this.currentResolve(); // Resolve only when we're done playing all chunks
        this.currentResolve = null;
      }
      return;
    }

    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const view = this.audioQueue.shift()!;
      const audioBuffer = this.audioContext.createBuffer(1, view.length, 44100);

      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < view.length; i++) {
        channelData[i] = view[i] / TTSPlayer.AUDIO_NORMALIZATION_FACTOR;
      }

      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.audioContext.destination);
      this.currentSource.onended = () => this.playNextChunk();
      this.currentSource.start();
    } catch (error) {
      console.error("Error playing audio chunk:", error);
      this.playNextChunk();
    }
  }
}

export const tts = ({ uuid, voice }: { uuid: string; voice: TtsVoice }) =>
  TTSPlayer.getInstance().play({ uuid, voice });
export const stopAudio = () => TTSPlayer.getInstance().stop();
