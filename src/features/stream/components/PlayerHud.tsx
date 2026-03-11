import { cn } from "@/lib/utils";
import { Children, cloneElement, HTMLAttributes, isValidElement } from "react";
import { FadeLoader } from "react-spinners";
import { useStream } from "../hooks/use-stream";
import { PlayerHudControls } from "./PlayerHudControls";
import { PlayerHudHeader } from "./PlayerHudHeader";

export interface PlayerHudProps extends HTMLAttributes<HTMLDivElement> {}

export function PlayerHud({ children, className, ...props }: PlayerHudProps) {
  const { error, player } = useStream();
  return (
    <div
      role="player-hud-wrapper"
      className={cn(
        " flex items-center justify-center relative group/player",
        className,
      )}
      {...props}
    >
      <div
        role="player-hud-content"
        className={cn(
          "h-full w-full flex justify-center items-center pointer-events-none",
          "[&_video]:z-10 [&_hls-video]:z-10",
        )}
      >
        <div
          role="spinner"
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            error && "hidden",
          )}
        >
          <FadeLoader color="white" />
        </div>

        {Children.map(children, (child) => {
          if (!isValidElement(child)) {
            return child;
          }

          // Player properties
          return cloneElement(child, {
            role: "player",
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
        <PlayerHudHeader />
        <PlayerHudControls />
      </div>
    </div>
  );
}
