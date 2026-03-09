import { useMultiInstanceDrag } from "@/hooks/use-multi-instance-drag";
import { cn } from "@/lib/utils";
import {
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { toast } from "sonner";

export const DropLocation = [
  "top",
  "left",
  "right",
  "bottom",
  "center",
] as const;
export type DropLocation = (typeof DropLocation)[number];

export type DropAreaProps = Omit<HTMLAttributes<HTMLDivElement>, "onDrop"> & {
  value?: string;
  onDrop?: (content: string, position: DropLocation, moving?: boolean) => void;
  onlyCenter?: boolean;
  disabled?: boolean | ((url?: string) => boolean);
  onDraggingOverStart?: () => void;
};

const paddingPercentage = 15;

export const DropArea = forwardRef<HTMLDivElement, DropAreaProps>(
  (
    {
      value,
      className,
      children,
      onDrop,
      onlyCenter = false,
      disabled = false,
      onDragOver,
      ...props
    },
    ref,
  ) => {
    const dropRef = useRef<HTMLDivElement>(null);
    const { notifyDrop, getDragState } = useMultiInstanceDrag();

    const calcDragPosition = useCallback(
      (x: number, y: number): DropLocation => {
        const res = 100;
        if (!dropRef.current) return "center";
        const { offsetWidth, offsetHeight } = dropRef.current;
        const xp = Math.trunc((x / offsetWidth) * res);
        const yp = Math.trunc((y / offsetHeight) * res);

        const offsetPixels = Math.trunc(
          Math.min(offsetWidth, offsetHeight) * (paddingPercentage / 100),
        );

        if (
          onlyCenter ||
          (x > offsetPixels &&
            x < offsetWidth - offsetPixels &&
            y > offsetPixels &&
            y < offsetHeight - offsetPixels)
        )
          return "center";

        if (xp < res / 2 && yp < res / 2) {
          if (xp < yp) return "left";
          else return "top";
        } else if (xp >= res / 2 && yp < res / 2) {
          if (res - xp > yp) return "top";
          else return "right";
        } else if (xp < res / 2 && yp >= res / 2) {
          if (xp < res - yp) return "left";
          else return "bottom";
        } else if (xp >= res / 2 && yp >= res / 2) {
          if (xp < yp) return "bottom";
          else return "right";
        }

        return "center";
      },
      [dropRef.current, onlyCenter],
    );

    useEffect(() => {
      if (!dropRef.current) return;

      function getDragXY(e: DragEvent) {
        if (!dropRef.current) return { x: 0, y: 0 };
        const bounding = dropRef.current.getBoundingClientRect();
        return {
          x: e.clientX - bounding.left,
          y: e.clientY - bounding.top,
        };
      }

      function handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();

        dropRef.current?.classList.remove(
          ...DropLocation.map((dp) => `drag-pos-${dp}`),
        );
        dropRef.current?.classList.remove("drag-over");

        const data = String(
          e.dataTransfer?.getData(
            e.dataTransfer?.types
              .filter((t) =>
                ["text/uri-list", "text/plain", "pane"].includes(t),
              )
              .toReversed()[0],
          ),
        );

        if (!data || data.trim() === "" || !data.includes("https")) {
          toast.error("Invalid URL");
          return;
        }

        const url = data.endsWith("/") ? data.slice(0, -1) : data;
        if (typeof disabled === "function" ? disabled(url) : disabled) return;

        const { x, y } = getDragXY(e);
        const position = calcDragPosition(x, y);
        const dragState = getDragState();
        const moving = !!(dragState.url && dragState.url.trim() === url.trim());

        onDrop && onDrop(url, position, moving);
        notifyDrop({
          value: url,
          swapUrl: position === "center" ? value : undefined,
        });
      }

      function handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();

        const isDisabled =
          typeof disabled === "function" ? disabled() : disabled;

        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = isDisabled ? "none" : "move";
        }

        const { x, y } = getDragXY(e);
        const posClass = `drag-pos-${calcDragPosition(x, y)}`;

        if (!dropRef.current?.classList.contains(posClass)) {
          onDragOver && onDragOver(e as any);
          dropRef.current?.classList.remove(
            ...DropLocation.map((dp) => `drag-pos-${dp}`),
          );
        }

        if (isDisabled) return;

        dropRef.current?.classList.add("drag-over");
        dropRef.current?.classList.add(posClass);
      }

      function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dropRef.current?.classList.remove(
          ...DropLocation.map((dp) => `drag-pos-${dp}`),
        );
        dropRef.current?.classList.remove("drag-over");
      }

      function handleDragEnter(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!e.dataTransfer) return;
      }

      dropRef.current.addEventListener("drop", handleDrop);
      dropRef.current.addEventListener("dragover", handleDragOver);
      dropRef.current.addEventListener("dragleave", handleDragLeave);
      dropRef.current.addEventListener("dragenter", handleDragEnter);

      return () => {
        dropRef.current?.removeEventListener("drop", handleDrop);
        dropRef.current?.removeEventListener("dragover", handleDragOver);
        dropRef.current?.removeEventListener("dragleave", handleDragLeave);
        dropRef.current?.removeEventListener("dragenter", handleDragEnter);
      };
    }, [
      dropRef.current,
      disabled,
      onlyCenter,
      onDrop,
      value,
      notifyDrop,
      getDragState,
    ]);

    return (
      <div
        role="drop-area"
        className={cn(
          "h-full relative group/drop-area",
          // "[&.drag-over>div>div]:!pointer-events-none",,
          // "[&>div]:pointer-events-none",
          className,
        )}
        ref={dropRef}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-[padding]",
            "[.drag-pos-center_&]:p-1",
            "[.drag-pos-top_&]:pt-1",
            "[.drag-pos-bottom_&]:pb-1",
            "[.drag-pos-left_&]:pl-1",
            "[.drag-pos-right_&]:pr-1",
          )}
        >
          <div
            className={cn(
              "h-full rounded-xl",
              "border-2 border-dashed border-transparent",
              "[.drag-over_&]:text-primary",
              "[.drag-over_&]:border-primary ",
              "[.drag-pos-center_&]:p-1.5",
              "[.drag-pos-top_&]:pt-1.5",
              "[.drag-pos-bottom_&]:pb-1.5",
              "[.drag-pos-left_&]:pl-1.5",
              "[.drag-pos-right_&]:pr-1.5",
              "[.drag-pos-top_&]:border-transparent [.drag-pos-top_&]:border-t-primary",
              "[.drag-pos-bottom_&]:border-transparent [.drag-pos-bottom_&]:border-b-primary",
              "[.drag-pos-left_&]:border-transparent [.drag-pos-left_&]:border-l-primary",
              "[.drag-pos-right_&]:border-transparent [.drag-pos-right_&]:border-r-primary",
              !(typeof disabled === "function" ? disabled() : disabled) && [
                "transition-[padding,border-color] duration-300",
              ],
            )}
            ref={ref}
          >
            {children || (
              <div className="h-full flex items-center justify-center p-4 whitespace-nowrap text-muted-foreground">
                <p className="text-xl sm:text-2xl lg:text-3xl animate-bounce">
                  Drop a live streaming url here
                </p>
              </div>
            )}
          </div>
          {/* </div> */}
        </div>
      </div>
    );
  },
);
