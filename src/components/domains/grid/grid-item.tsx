import { GridItemPosition } from "@/lib/types";
import { cn, exclude } from "@/lib/utils";
import {
  forwardRef,
  HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

const animationAttributes = [
  "gridColumnEnd",
  "gridColumnStart",
  "gridRowEnd",
  "gridRowStart",
] as const;

const animationSpeed = 15;
const animationTick = 1;

export type GridItemProps = HTMLAttributes<HTMLDivElement> & {
  item: GridItemPosition;
  isFullscreen?: boolean;
  grid: {
    width: number;
    height: number;
  };
};

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ children, className, grid, item, isFullscreen, ...props }, ref) => {
    const playerWrapperRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => playerWrapperRef.current!, []);

    const fullscreenPosition = useMemo(
      () => ({
        gridColumnEnd: grid.width,
        gridColumnStart: 1,
        gridRowEnd: grid.height,
        gridRowStart: 1,
        zIndex: 10,
      }),
      [grid.width, grid.height]
    );

    useEffect(() => {
      if (!playerWrapperRef.current) return;
      const newState = isFullscreen
        ? fullscreenPosition
        : {
            gridColumnEnd: Math.max((item.x || 0) + (item.width || 0), 1),
            gridColumnStart: Math.max(item.x || 0, 1),
            gridRowEnd: Math.max((item.y || 0) + (item.height || 0), 1),
            gridRowStart: Math.max(item.y || 0, 1),
            zIndex: 1,
          };

      (
        Object.keys(exclude(newState, ...animationAttributes)) as Array<never>
      ).forEach((att) => {
        if (!playerWrapperRef.current) return;
        playerWrapperRef.current.style[att] = String(newState[att] || "");
      });

      const currState = animationAttributes.reduce((acc, att) => {
        if (!playerWrapperRef.current) return acc;
        acc[att] =
          parseInt(playerWrapperRef.current.style[att]) || newState[att];
        return acc;
      }, {} as { [key in (typeof animationAttributes)[number]]: number });

      function calcOffset(start: number, end: number) {
        return Math.max(
          Math.abs(Math.trunc(Math.abs(start - end) / animationSpeed)),
          1
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
          // console.log("animation finished");
        }
      }, animationTick);

      return () => clearInterval(interval);
    }, [playerWrapperRef, isFullscreen]);

    return (
      <div
        {...props}
        className={cn("overflow-hidden", className)}
        ref={playerWrapperRef}
        {...props}
      >
        {children}
      </div>
    );
  }
);
