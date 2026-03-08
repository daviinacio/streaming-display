import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { usePreference } from "@/hooks/use-preference";
import { cn } from "@/lib/utils";
import { DialogProps } from "@radix-ui/react-dialog";
import { CheckIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";
import { applyTheme } from "@/lib/theme.ts";
import { PaletteIcon } from "lucide-react";

const colorList = {
  green: "142 72% 42%",
  blue: "206 100% 57%",
  pink: "316 73% 64%",
  amber: "43 96% 56%",

  teal: "173 80% 40%",
  indigo: "234 89% 74%",
  purple: "271 91% 65%",
  orange: "27 96% 61%",

  lime: "84 81% 44%",
  sky: "198 93% 60%",
  rose: "351 95% 71%",
  red: "0 84% 60%",
  // red: "0 91% 71%",
  // yellow: "40 96% 53%",
} as const;

export type ThemeDialogProps = {} & DialogProps;

export function ThemeDialog({ children, ...props }: ThemeDialogProps) {
  const [colorPrimary, setColorPrimary] = usePreference("color-primary");

  useEffect(() => {
    applyTheme({ colorPrimary });
  }, [colorPrimary]);

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full sm:max-w-[320px] sm:h-fit group/dialog">
        {/* <DialogContent className="w-full sm:max-w-[320px] h-full sm:h-fit group/dialog"> */}
        <DialogHeader className="flex flex-row items-center gap-3">
          <PaletteIcon className="size-8" />
          <div>
            <DialogTitle>Customize</DialogTitle>
            <DialogDescription>Change the color palette</DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-4 gap-4 h-fit">
            {Object.entries(colorList).map(([name, color]) => (
              <TooltipProvider key={name}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "size-12 p-0 rounded-full",
                        "hover:scale-110 active:scale-90 transition-[transform] mx-auto",
                      )}
                      onClick={() => setColorPrimary(color)}
                      style={{
                        backgroundColor: `hsl(${color})`,
                      }}
                    >
                      {colorPrimary === color && (
                        <CheckIcon className="size-8 text-white" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    className="font-semibold pointer-events-none hidden group-hover/dialog:flex"
                    style={{
                      backgroundColor: `hsl(${color})`,
                    }}
                  >
                    {name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
        <DialogFooter className="grid grid-cols-1 sm:grid-cols-2">
          <div />
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
