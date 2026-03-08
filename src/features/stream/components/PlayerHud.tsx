import { cn } from "@/lib/utils";
import { Children, cloneElement, HTMLAttributes, isValidElement } from "react";
import FadeLoader from "react-spinners/FadeLoader";

export interface PlayerHudProps extends HTMLAttributes<HTMLDivElement> {}

export function PlayerHud({ children, className, ...props }: PlayerHudProps) {
  return (
    <div
      className={cn(
        "pointer-events-none flex items-center justify-center relative",
        className,
      )}
      {...props}
    >
      <div
        key="spinner"
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          // error && "hidden"
        )}
      >
        <FadeLoader color="white" />
      </div>
      <div className="h-full w-full flex justify-center items-center">
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
          });
        })}
      </div>
    </div>
  );
}
