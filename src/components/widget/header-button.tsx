import { Button, ButtonProps } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

export function HeaderButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "p-2 rounded-full hover:md:bg-black/10 active:bg-black/10",
        "group text-white active:text-white hover:md:text-white",
        className
      )}
      variant="ghost"
      {...props}
    >
      <Slot
        className={cn(
          "w-5 h-5",
          "group-hover:scale-125 group-active:scale-90",
          "transition-[transform] group-active:duration-100 duration-200"
        )}
      >
        {children}
      </Slot>
    </Button>
  );
}
