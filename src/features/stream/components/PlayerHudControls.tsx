import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  ScrollArea,
  Slider,
} from "@/components/ui";
import { cn, copyToClipboard } from "@/lib/utils";
import { PlayerHudAction } from "./PlayerHudAction";
import { PluginMount } from "@/features/plugin";
import {
  ClipboardCopyIcon,
  PauseIcon,
  PlayIcon,
  ReloadIcon,
  SpeakerLoudIcon,
  SpeakerModerateIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
} from "@radix-ui/react-icons";
import {
  ExpandIcon,
  PictureInPicture2Icon,
  PictureInPictureIcon,
  ShrinkIcon,
} from "lucide-react";
import { useStream } from "../hooks/use-stream";

export function PlayerHudControls() {
  const { handler, player, refresh } = useStream();
  return (
    <div
      role="player-hud-controls"
      className={cn(
        // "absolute bottom-0 left-0 right-0 z-20",
        "flex items-center justify-between pointer-events-auto",
        "p-1 transition-all duration-300",
        "z-20 from-transparent to-transparent bg-gradient-to-t group-hover/player:from-black/80 duration-300",
        // "!pointer-events-none",
        // (error || !data) && "hidden"
      )}
    >
      <ScrollArea
        orientation="horizontal"
        className="max-w-[50%]"
        scrollBarClassName="hidden"
      >
        <div className={cn("flex items-center")}>
          <PlayerHudAction onClick={player.togglePlaying}>
            {player.playing ? <PauseIcon /> : <PlayIcon />}
          </PlayerHudAction>

          <PluginMount position="controls_left" />

          <HoverCard open={player.muted ? false : undefined}>
            <HoverCardTrigger>
              <PlayerHudAction
                className="relative top-0 z-[10]"
                onClick={player.toggleMuted}
              >
                {player.muted ? (
                  <SpeakerOffIcon />
                ) : typeof player.volume !== "undefined" ? (
                  player.volume < 0.2 ? (
                    <SpeakerQuietIcon />
                  ) : player.volume >= 0.2 && player.volume < 0.8 ? (
                    <SpeakerModerateIcon />
                  ) : (
                    <SpeakerLoudIcon />
                  )
                ) : undefined}
              </PlayerHudAction>
            </HoverCardTrigger>
            <HoverCardContent
              className="w-40 p-4 z-[0] pl-12 rounded-full bg-background/50 flex items-end pointer-events-auto"
              side="right"
              align="start"
              alignOffset={-2}
              sideOffset={-46}
              onDoubleClick={(e) => e.stopPropagation()}
              onDragStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Slider
                defaultValue={[0.8]}
                max={1}
                step={0.05}
                value={[player.volume || 0]}
                orientation="horizontal"
                onValueChange={(value) => player.setVolume(value[0])}
                onDragStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </HoverCardContent>
          </HoverCard>
        </div>
      </ScrollArea>
      <ScrollArea
        orientation="horizontal"
        scrollBarClassName="hidden"
        className="max-w-[50%]"
      >
        <div className="flex items-center justify-end">
          <PluginMount position="controls_right" />

          {handler?.sourceUrl && (
            <PlayerHudAction
              title="Copy source url"
              onClick={() => copyToClipboard(handler?.sourceUrl, "Source URL")}
            >
              <ClipboardCopyIcon />
            </PlayerHudAction>
          )}

          <PlayerHudAction
            title="Refresh link"
            className={cn(
              !refresh && "animate-spin",
              !refresh && "text-neutral-500",
            )}
            onClick={() => refresh && refresh()}
            disabled={!refresh}
          >
            <ReloadIcon />
          </PlayerHudAction>

          <PlayerHudAction
            title="Picture-in-picture"
            onClick={player.togglePip}
          >
            {player.pip ? <PictureInPicture2Icon /> : <PictureInPictureIcon />}
          </PlayerHudAction>

          <PlayerHudAction onClick={player.toggleFit}>
            {player.fit ? <ShrinkIcon /> : <ExpandIcon />}
          </PlayerHudAction>
        </div>
      </ScrollArea>
    </div>
  );
}
