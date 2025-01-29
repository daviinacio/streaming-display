import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type CheckboxBaseProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & {
  intermediate?: boolean;
};

const CheckboxBase = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxBaseProps
>(({ className, checked, intermediate, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-input data-[state=checked]:border-primary shadow ",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed",
      "disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    checked={checked}
    {...props}
  >
    {intermediate && !checked && (
      <MinusIcon className="h-[14px] w-[14px] text-muted-foreground" />
    )}
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <CheckIcon className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
CheckboxBase.displayName = CheckboxPrimitive.Root.displayName + "Base";

export type CheckboxProps = CheckboxBaseProps & {
  label?: React.ReactNode;
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, style, label, children, ...props }, ref) => {
  const inputRef = React.useRef<HTMLButtonElement | null>(null);
  React.useImperativeHandle(ref, () => inputRef.current!, []);

  return (
    <label
      className={cn(
        "flex items-center space-x-2 select-none text-sm",
        !props.disabled && "cursor-pointer",
        className
      )}
      style={style}
    >
      <CheckboxBase {...props} ref={inputRef} />
      <span className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label} {children}
      </span>
    </label>
  );
});

Checkbox.displayName = "Checkbox";

export { CheckboxBase, Checkbox };
