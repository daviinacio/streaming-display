import { GridItemPosition, GridItem as GridItemType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  forwardRef,
  HTMLAttributes,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

export type GridItemProps = HTMLAttributes<HTMLDivElement> & {
  item: GridItemType;
  position?: GridItemPosition;
  isMaximized?: boolean;
  grid?: {
    count: number;
  };
};

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ children, className, position, isMaximized, ...props }, ref) => {
    const playerWrapperRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => playerWrapperRef.current!, []);

    const gridPosition = useMemo((): GridItemPosition | undefined => {
      if (isMaximized) {
        return {
          height: 100,
          width: 100,
          x: 0,
          y: 0,
        };
      }
      return position;
    }, [position, isMaximized]);

    return (
      <div
        role="grid-item"
        className={cn(
          "absolute transition-[width,height,top,left] duration-300",
          className
        )}
        ref={playerWrapperRef}
        style={{
          width: `${gridPosition?.width}%`,
          height: `${gridPosition?.height}%`,
          top: `${gridPosition?.y}%`,
          left: `${gridPosition?.x}%`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
