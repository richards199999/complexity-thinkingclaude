import { useMutation } from "@tanstack/react-query";

import { ReactNodeActionReturnType } from "@/content-script/main-world/react-node";
import { webpageMessenger } from "@/content-script/main-world/webpage-messenger";
import { DomHelperSelectors } from "@/utils/DomSelectors";
import { stopAudio, tts, TtsVoice } from "@/utils/tts";

type UseTextToSpeechProps = {
  messageIndex: number;
};

export default function useTextToSpeech({
  messageIndex,
}: UseTextToSpeechProps) {
  const mutation = useMutation({
    mutationKey: ["textToSpeech", messageIndex],
    mutationFn: async ({ voice }: { voice: TtsVoice }) => {
      const messageBackendUuid = (await webpageMessenger.sendMessage({
        event: "getReactNodeData",
        payload: {
          action: "getMessageBackendUuid",
          querySelector: `${DomHelperSelectors.THREAD.MESSAGE.BLOCK}[data-index="${messageIndex}"]`,
        },
        timeout: 5000,
      })) as ReactNodeActionReturnType["getMessageBackendUuid"];

      if (!messageBackendUuid)
        throw new Error("Message backend UUID not found");

      await tts({ uuid: messageBackendUuid, voice });
    },
  });

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return {
    isSpeaking: mutation.isPending,
    startPlaying: mutation.mutate,
    stopPlaying: stopAudio,
  };
}
