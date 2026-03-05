import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none gap-2",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow active:bg-primary/80 md:hover:bg-primary/80 focus-visible:ring-offset-1 focus-visible:ring-2",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm active:bg-destructive/80 md:hover:bg-destructive/80",
        warning:
          "bg-amber-500 dark:bg-amber-600 text-zinc-50 shadow-sm active:bg-amber-500/80 md:hover:bg-amber-500/80",
        outline:
          "border border-input bg-background shadow-sm active:bg-accent md:hover:bg-accent active:text-accent-foreground md:hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm active:bg-secondary/80 md:hover:bg-secondary/80",
        ghost:
          "active:bg-accent md:hover:bg-accent active:text-accent-foreground md:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 active:underline md:hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        link: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      disabled,
      isLoading = false,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const form = useFormContext();

    const isShowLoading = React.useMemo(() => {
      if (isLoading) return true;
      if (!form) return false;
      return form.formState.isSubmitting && type === "submit";
    }, [form, isLoading]);

    const isButtonDisabled = React.useMemo(() => {
      if (disabled !== undefined) return disabled;
      if (!form) return false;
      return (
        (!form.formState.isDirty && type === "submit") ||
        form.formState.isSubmitting
      );
    }, [form, disabled]);

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isButtonDisabled || isShowLoading}
        type={type}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {isShowLoading && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
