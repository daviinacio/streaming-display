import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  ScrollArea,
  Slider,
} from "@/components/ui";
import { PluginMount } from "@/features/plugin";
import { cn, copyToClipboard } from "@/lib/utils";
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
  ExternalLinkIcon,
  PictureInPicture2Icon,
  PictureInPictureIcon,
  ShrinkIcon,
  XIcon,
} from "lucide-react";
import { Children, cloneElement, HTMLAttributes, isValidElement } from "react";
import { useStream } from "../hooks/use-stream";
import { PlayerHudAction } from "./PlayerHudAction";
import { FadeLoader } from "react-spinners";

export interface PlayerHudProps extends HTMLAttributes<HTMLDivElement> {}

export function PlayerHud({ children, className, ...props }: PlayerHudProps) {
  const { src, handler, grid, error, player, refresh } = useStream();

  const title = (handler ? handler.title : !error && "Loading...") || src;

  return (
    <div
      className={cn(
        " flex items-center justify-center relative group/player",
        className,
      )}
      {...props}
    >
      <div
        key="spinner"
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          !player.buffering && "hidden",
        )}
      >
        <FadeLoader color="white" />
      </div>
      <div className="h-full w-full flex justify-center items-center pointer-events-none">
        {Children.map(children, (child) => {
          // 1. Sempre verifique se o filho é um elemento React válido
          if (!isValidElement(child)) {
            return child;
          }

          // 2. Clone o elemento e injete as novas propriedades
          return cloneElement(child, {
            role: "player-hud-child",
            muted: true,
            controls: false,
            playing: true,
            width: "100%",
            height: "100%",
            className: "z-10",
            ...child.props,
            ...player,
          });
        })}
      </div>
      <div
        className={cn(
          "[&_[data-visibility]]:transition-opacity [&_[data-visibility]]:duration-500",
          // Default visibility
          "[&_[data-visibility=default]]:opacity-0",
          "group-hover/player:data-[visibility=default]:[&_[data-visibility=default]]:opacity-100",
          // Always visible
          "[&_[data-visibility=always]]:opacity-100",
        )}
      >
        <div
          role="player-header"
          className={cn(
            "absolute top-0 left-0 right-0",
            "flex items-center justify-between",
            "p-1 pl-3 transition-all duration-300",
            "z-20 from-transparent to-transparent bg-gradient-to-b group-hover/player:from-black/80",
            " pointer-events-none",
          )}
        >
          <div className="max-w-[70%] pointer-events-auto flex gap-2 !text-white">
            {title && (
              <div className={cn("flex gap-1 max-w-full items-center")}>
                <p
                  className={cn(
                    "text-2xl font-semibold truncate translate-y-[-2px]",
                    "drop-shadow-text",
                  )}
                  onClick={() => title && copyToClipboard(title, "Title")}
                  data-visibility="default"
                >
                  {title}
                </p>
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  data-visibility="default"
                >
                  <PlayerHudAction size="sm">
                    <ExternalLinkIcon />
                  </PlayerHudAction>
                </a>
                <PluginMount position="header_left" />
              </div>
            )}
          </div>
          <div className="flex items-center">
            <PluginMount position="header_right" />
            <PlayerHudAction onClick={() => grid.remove()}>
              <XIcon />
            </PlayerHudAction>
          </div>
        </div>
        <div
          role="player-controls"
          className={cn(
            "absolute bottom-0 left-0 right-0 z-20",
            "flex items-center justify-between",
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
                  onClick={() =>
                    copyToClipboard(handler?.sourceUrl, "Source URL")
                  }
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
                {player.pip ? (
                  <PictureInPicture2Icon />
                ) : (
                  <PictureInPictureIcon />
                )}
              </PlayerHudAction>

              <PlayerHudAction onClick={player.toggleFit}>
                {player.fit ? <ShrinkIcon /> : <ExpandIcon />}
              </PlayerHudAction>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
