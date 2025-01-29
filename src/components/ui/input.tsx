import { VariantProps, cva } from "class-variance-authority";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  cn(
    "flex rounded-md bg-transparent",
    "px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent",
    "file:text-sm file:font-medium placeholder:text-muted-foreground",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:outline-none"
  ),
  {
    variants: {
      variant: {
        default: cn(
          "border border-input  shadow-sm",
          "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
          "group-[.field-warning]:border-warning group-[.field-warning]:focus:ring-warning",
          "group-[.field-error]:border-destructive group-[.field-error]:focus:ring-destructive"
        ),
        blank: "",
      },
      size: {
        default: "h-9 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  icon?: JSX.Element;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPosition, variant, size, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current!, []);
    const [showPassword, setShowPassword] = React.useState(false);

    if (type === "password") {
      const IconComp = showPassword ? EyeIcon : EyeOffIcon;
      icon = icon || (
        <IconComp
          className={cn("pointer-events-auto cursor-pointer")}
          onMouseDown={() => setTimeout(() => inputRef.current?.focus())}
          onClick={() => setShowPassword((p) => !p)}
        />
      );
      iconPosition = iconPosition || "right";
    }

    return (
      <div className={cn("relative w-full inline-block")}>
        <input
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          className={inputVariants({
            variant,
            size,
            className: cn(
              (icon && (iconPosition === "right" ? "pr-10" : "pl-10")) || "",
              className
            ),
          })}
          ref={inputRef}
          {...props}
        />
        {icon && (
          <div
            className={cn(
              "absolute top-[50%] translate-y-[-50%]",
              "text-muted-foreground [input:focus-visible+&]:text-primary transition-colors",
              "group-[.field-warning]:text-warning",
              "group-[.field-error]:text-destructive",
              `${iconPosition === "right" ? "right-1.5" : "left-1.5"}`
            )}
          >
            {React.cloneElement(icon as React.ReactElement, {
              className: cn(
                "h-8 w-8 p-1.5 pointer-events-none",
                icon.props.className
              ),
            })}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
