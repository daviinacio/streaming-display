import * as React from "react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast group-[.toaster]:border-0 group-[.toaster]:shadow-lg",
            "group-[.toaster]:bg-background group-[.toaster]:text-foreground",
            "data-[type=error]:group-[.toaster]:bg-destructive data-[type=error]:group-[.toaster]:text-white",
            "data-[type=info]:group-[.toaster]:bg-info data-[type=info]:group-[.toaster]:text-info-foreground",
            "data-[type=warning]:group-[.toaster]:bg-warning data-[type=warning]:group-[.toaster]:text-warning-foreground",
            "data-[type=success]:group-[.toaster]:bg-success data-[type=success]:group-[.toaster]:text-success-foreground",
            "whitespace-pre-wrap"
          ),
          description: cn(
            "group-[.toast]:text-muted-foreground",
            ["group-data-[type=error]:group-[.toast]:text-white/60"],
            ["group-data-[type=info]:group-[.toast]:text-white/60"],
            "group-data-[type=warning]:group-[.toast]:text-warning-foreground/60",
            "group-data-[type=success]:group-[.toast]:text-success-foreground/60"
          ),
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
