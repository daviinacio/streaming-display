import {
  Button,
  ButtonProps,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

export function PlayerHudAction({
  className,
  children,
  onDoubleClick,
  size,
  title,
  ...props
}: ButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "p-2 rounded-full active:bg-black/5 md:hover:bg-black/5",
              "active:text-white md:hover:text-white ",
              "transition-colors group/button pointer-events-auto",
              className,
            )}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDoubleClick && onDoubleClick(e);
            }}
            variant="ghost"
            data-visibility="default"
            {...props}
          >
            <Slot
              className={cn(
                size === "sm" ? "size-5" : "size-7",
                "group-hover/button:scale-125 group-active/button:scale-90",
                "transition-[transform] group-active/button:duration-75 duration-200",
              )}
            >
              {children}
            </Slot>
          </Button>
        </TooltipTrigger>
        {title && (
          <TooltipContent className="text-white font-semibold shadow-sm shadow-black">
            {title}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
