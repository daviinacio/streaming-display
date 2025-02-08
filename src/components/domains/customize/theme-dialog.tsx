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
import { DialogProps } from "@radix-ui/react-dialog";
import { CheckIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

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
  const preferences = usePreference();
  const colorPrimary = preferences.getItem("color-primary");

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", colorPrimary);

    const colorPrimaryDark = colorPrimary.split(" ").map((c, i) => {
      if (i !== 2) return c;
      return `${Math.max(0, parseInt(c) - 10)}%`;
    });
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", `hsl(${colorPrimaryDark})`);
  }, [colorPrimary]);

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[320px] max-w-[320px]">
        <DialogHeader>
          <DialogTitle>Customize</DialogTitle>
          <DialogDescription>Change the color palette</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(colorList).map(([name, color]) => (
            <TooltipProvider key={name}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="size-12 p-0 rounded-full hover:scale-110 active:scale-90 transition-[transform]"
                    onClick={() => preferences.setItem("color-primary", color)}
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
                  className="font-semibold pointer-events-none"
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
        <DialogFooter>
          <DialogClose>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
