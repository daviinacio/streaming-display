import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(
      "relative flex touch-none select-none items-center",
      orientation === "horizontal" && "w-full",
      orientation === "vertical" && "h-full w-fit",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative grow overflow-hidden rounded-full bg-primary/20",
        orientation === "horizontal" && "h-1.5 w-full",
        orientation === "vertical" && "w-1.5 h-full mx-1"
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          "absolute h-full bg-primary",
          orientation === "horizontal" && "h-full",
          orientation === "vertical" && "w-full"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className=" cursor-pointer block h-4 w-4 rounded-full border border-primary/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
