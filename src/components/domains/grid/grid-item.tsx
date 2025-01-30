import { GridItemPosition } from "@/lib/types";
import { cn, exclude } from "@/lib/utils";
import { HTMLAttributes, useEffect, useMemo, useRef } from "react";

const animationAttributes = [
  "gridColumnEnd",
  "gridColumnStart",
  "gridRowEnd",
  "gridRowStart",
] as const;

const animationSpeed = 10;
const animationTick = 10;

export type GridItemProps = HTMLAttributes<HTMLDivElement> & {
  item: GridItemPosition;
  isFullscreen?: boolean;
  grid: {
    width: number;
    height: number;
  };
};

export function GridItem({
  children,
  className,
  grid,
  item,
  isFullscreen,
  ...props
}: GridItemProps) {
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  const fullscreenPosition = useMemo(
    () => ({
      gridColumnEnd: grid.width,
      gridColumnStart: 2,
      gridRowEnd: grid.height,
      gridRowStart: 2,
      zIndex: 10,
    }),
    [grid.width, grid.height]
  );

  useEffect(() => {
    if (!playerWrapperRef.current) return;
    const newState = isFullscreen
      ? fullscreenPosition
      : {
          gridColumnEnd: (item.x || 0) + (item.width || 0) + 1,
          gridColumnStart: (item.x || 0) + 1,
          gridRowEnd: (item.y || 0) + (item.height || 0) + 1,
          gridRowStart: (item.y || 0) + 1,
          zIndex: undefined,
        };

    (
      Object.keys(exclude(newState, ...animationAttributes)) as Array<never>
    ).forEach((att) => {
      if (!playerWrapperRef.current) return;
      playerWrapperRef.current.style[att] = String(newState[att] || "");
    });

    const currState = animationAttributes.reduce((acc, att) => {
      if (!playerWrapperRef.current) return acc;
      acc[att] = parseInt(playerWrapperRef.current.style[att]) || newState[att];
      return acc;
    }, {} as { [key in (typeof animationAttributes)[number]]: number });

    function calcOffset(start: number, end: number) {
      return (
        Math.abs(
          Math.trunc(
            (Math.max(start, end) - Math.min(start, end)) / animationSpeed
          )
        ) + 1
      );
    }

    const interval = setInterval(() => {
      if (!playerWrapperRef.current) return;

      animationAttributes.forEach((att) => {
        if (!playerWrapperRef.current) return;
        const start = currState[att];
        const end = newState[att];
        const offset = calcOffset(start, end);

        if (end > start) currState[att] += offset;
        else if (end < start) currState[att] -= offset;

        playerWrapperRef.current.style[att] = String(currState[att]);
      });

      if (
        animationAttributes.every((att) => currState[att] === newState[att])
      ) {
        clearInterval(interval);
        console.log("animation finished");
      }
    }, animationTick);

    return () => clearInterval(interval);
  }, [playerWrapperRef, isFullscreen]);

  return (
    <div
      {...props}
      className={cn(
        "ring-1 ring-primary relative rounded-lg overflow-hidden bg-black text-white",
        className
      )}
      ref={playerWrapperRef}
      {...props}
    >
      {children}
    </div>
  );
}
