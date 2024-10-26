import { LuHeadphones, LuPause } from "react-icons/lu";

import { Container } from "@/content-script/components/ThreadMessageStickyToolbar";
import SpeakingAnimation from "@/content-script/components/ThreadMessageStickyToolbar/TtsAnimation";
import useTextToSpeech from "@/content-script/hooks/useTextToSpeech";
import CplxUserSettings from "@/cplx-user-settings/CplxUserSettings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuContext,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/DropdownMenu";
import { DomSelectors } from "@/utils/DomSelectors";
import { TTS_VOICES, TtsVoice } from "@/utils/tts";

export default function TtsButton({
  containers,
  containerIndex,
}: {
  containers: Container[];
  containerIndex: number;
}) {
  const { isSpeaking, startPlaying, stopPlaying } = useTextToSpeech({
    messageIndex: containerIndex + 1,
  });

  const $bottomButtonBar = $(containers?.[containerIndex]?.messageBlock).find(
    DomSelectors.THREAD.MESSAGE.BOTTOM_BAR,
  );

  const play = async (voice: TtsVoice) => {
    if (isSpeaking) {
      stopPlaying();
    } else {
      startPlaying({
        voice,
      });
    }
  };

  if (!$bottomButtonBar.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuContext>
        {(context) => (
          <DropdownMenuTrigger>
            <div
              className={cn(
                "tw-flex tw-w-max tw-items-center tw-gap-2 tw-rounded-md tw-p-3 tw-transition-all tw-animate-in tw-fade-in hover:tw-cursor-pointer hover:tw-bg-secondary active:tw-scale-95",
                {
                  "tw-bg-secondary tw-px-4 tw-shadow-lg": isSpeaking,
                },
              )}
              onClick={(e) => {
                e.stopPropagation();

                if (context.open) context.setOpen(false);

                play(CplxUserSettings.get().defaultTtsVoice ?? TTS_VOICES[0]);
              }}
              onContextMenu={(e) => {
                e.preventDefault();

                if (isSpeaking) return;

                context.setOpen(!context.open);
              }}
            >
              {isSpeaking ? (
                <>
                  <SpeakingAnimation isActive rows={3} cols={15} />
                  <LuPause className="tw-size-4" />
                </>
              ) : (
                <LuHeadphones className="tw-size-4" />
              )}
            </div>
          </DropdownMenuTrigger>
        )}
      </DropdownMenuContext>
      <DropdownMenuContent>
        {TTS_VOICES.map((voice) => (
          <DropdownMenuItem
            key={voice}
            value={voice}
            onClick={() => {
              play(voice);
              CplxUserSettings.set((state) => {
                state.defaultTtsVoice = voice;
              });
            }}
          >
            {voice}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
