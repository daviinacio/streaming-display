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

export function HeaderButton({
  className,
  children,
  title,
  ...props
}: ButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "p-2 rounded-full hover:md:bg-black/10 active:bg-black/10",
              "group/button text-white active:text-white hover:md:text-white",
              className
            )}
            variant="ghost"
            {...props}
          >
            <Slot
              className={cn(
                "w-5 h-5",
                "group-hover/button:scale-125 group-active/button:scale-90",
                "transition-[transform] group-active/button:duration-100 duration-200"
              )}
            >
              {children}
            </Slot>
          </Button>
        </TooltipTrigger>
        {title && <TooltipContent>{title}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}
