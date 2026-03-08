import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
  Control,
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  Path,
  UseFormReturn,
  useFormContext,
} from "react-hook-form";

import {
  Label,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";

import { cn, exclude } from "@/lib/utils";

export type FormProps<D extends FieldValues> = {
  form: UseFormReturn<D>;
  isFetching?: boolean;
  disabled?: boolean;
} & React.FormHTMLAttributes<HTMLFormElement>;

function Form<D extends FieldValues>({
  children,
  form,
  className,
  isFetching = false,
  disabled = false,
  ...props
}: FormProps<D>) {
  return (
    <FormProvider isFetching={isFetching} disabled={disabled} {...form}>
      <form
        className={cn("grid gap-6", className)}
        noValidate={true}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormFieldBase = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

export type FormFieldProps<D extends FieldValues> = {
  control: Control<D>;
  name: Path<D>;
  label?: string | React.ReactElement;
  action?: React.ReactElement;
  className?: string;
  children: React.ReactElement;
  variant?: "regular" | "inline";
  warning?: string | boolean;
};

function FormField<D extends FieldValues>({
  name,
  label,
  action,
  className,
  variant = "regular",
  children,
  warning,
}: FormFieldProps<D>): React.ReactElement<FormFieldProps<D>> {
  const [isMandatory, setIsMandatory] = React.useState(false);
  const form = useFormContext();
  const fieldValue = form.control._formValues[name];
  // const fieldValue = useWatch<D>({ name });

  // console.log({
  //   isSubmitting: form.formState.isSubmitting,
  // });

  React.useEffect(() => {
    // if (!label || isMandatory) return;

    // if (form.control._fields[name] && form.control._fields[name]?._f) {
    //   form.control._fields[name]._f.value = 13;
    // }
    // console.log(name, form.control._fields[name]?._f["value"]);

    // form.control._reset();
    // console.log(form.control._fields);

    form.control._executeSchema([name]).then((r) => {
      const type = r.errors[name as keyof typeof r.errors]?.type;
      console.log(type);
      if (!type) return;

      // console.log("required", name, type);
      setIsMandatory(
        ["required", "too_small", "custom", "invalid_type"].includes(
          type as string,
        ),
      );
    });
  }, [form.control, name, label, fieldValue, isMandatory]);

  const isForwardRef =
    // @ts-ignore
    String(children.type.$$typeof) === "Symbol(react.forward_ref)";

  // @ts-ignore
  const childrenName = children.type.displayName;
  const inlineLabel = ["Checkbox"].includes(childrenName);

  const formItemRef = React.useRef<HTMLDivElement>(null);

  const tooltipMaxWidth = React.useMemo(() => {
    if (!formItemRef.current) return;
    return formItemRef.current.offsetWidth;
  }, [formItemRef.current]);

  return (
    <FormFieldBase
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          ref={formItemRef}
          className={cn(
            variant === "regular" && "flex flex-col gap-1 relative",
            variant === "inline" &&
              label &&
              "grid grid-cols-4 items-center gap-4 relative",
            warning && "field-warning",
            "flex-1",
            className,
          )}
        >
          {(label || action) && !inlineLabel && (
            <div
              className={cn("relative", variant === "inline" && "text-right")}
            >
              {label && (
                <FormLabel className="font-bold relative">
                  {label}
                  {isMandatory ? (
                    <span
                      className={cn(
                        "text-destructive ml-1 absolute top-0",
                        "group-[.field-warning]:text-warning",
                        "group-[.field-error]:text-destructive",
                      )}
                    >
                      *
                    </span>
                  ) : (
                    ""
                  )}
                </FormLabel>
              )}
              <div className="absolute right-0 bottom-0">{action}</div>
            </div>
          )}

          <FormMessageTooltip
            isForwardRef={isForwardRef}
            enabled={variant === "inline"}
            type={label ? "normal" : "compact"}
            className={label && "col-span-3 text-left"}
            maxWidth={tooltipMaxWidth}
            text={typeof warning === "string" ? warning : undefined}
          >
            <div className="relative h-full">
              <FormControl className={label && "col-span-3 text-left"}>
                {React.cloneElement(children, {
                  ...(isForwardRef ? field : exclude(field, "ref")),
                  ...children.props,
                  ...(["Checkbox", "Switch"].includes(childrenName) && {
                    checked: field.value,
                    onCheckedChange: (value: string) => {
                      // @ts-ignore
                      form.setValue(name, Boolean(value), {
                        shouldDirty: true,
                      });
                      form.trigger(name);
                    },
                  }),
                  ...(childrenName === "Select" && {
                    onValueChange: (value: string) => {
                      // @ts-ignore
                      form.setValue(name, value, {
                        shouldDirty: true,
                      });
                      form.trigger(name);
                    },
                  }),
                  label: String(label),
                  disabled:
                    children.props.disabled ||
                    form.formState.isSubmitting ||
                    // @ts-ignore
                    form.disabled,
                  className: cn(
                    children.props.className,
                    // @ts-ignore
                    form.isFetching && "invisible",
                  ),
                })}
              </FormControl>
              {/* @ts-ignore */}
              {form.isFetching && <Skeleton className="absolute inset-0" />}
            </div>
          </FormMessageTooltip>
          {variant === "regular" && (
            <FormMessage className="absolute bottom-0 left-0 translate-y-[100%]">
              {typeof warning === "string" && warning}
            </FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}

FormField.displayName = "FormField";

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();
  const { error } = useFormField();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={cn(
          "group",
          error && "field-error",
          error ? className?.replace("field-warning", "") : className,
        )}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        "text-[0.8rem] font-medium",
        "group-[.field-warning]:text-warning",
        "group-[.field-error]:text-destructive",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export type FormMessageTooltipProps =
  React.HTMLAttributes<HTMLParagraphElement> & {
    enabled?: boolean;
    type?: "normal" | "compact";
    maxWidth?: number;
    isForwardRef?: boolean;
    text?: string;
  };

const FormMessageTooltip = React.forwardRef<
  HTMLParagraphElement,
  FormMessageTooltipProps
>(
  (
    {
      className,
      enabled = true,
      children,
      type = "normal",
      maxWidth,
      isForwardRef = true,
      text,
      ...props
    },
    ref,
  ) => {
    const { error, formMessageId } = useFormField();
    const errorMessage = error ? String(error?.message) : "";

    const [bodyMessage, setBodyMessage] = React.useState(errorMessage || text);

    React.useEffect(() => {
      setBodyMessage(errorMessage || text);
    }, [errorMessage, text]);

    if (!enabled) return children;

    return (
      <TooltipProvider>
        <Tooltip open={!!bodyMessage}>
          <TooltipTrigger asChild>
            {isForwardRef ? (
              children
            ) : (
              <div className={className}>{children}</div>
            )}
          </TooltipTrigger>
          <TooltipContent
            side={
              (
                {
                  normal: "right",
                  compact: "bottom",
                } as const
              )[type]
            }
            sideOffset={
              (
                {
                  normal: 12,
                  compact: -8,
                } as const
              )[type]
            }
            style={{
              maxWidth:
                (type === "compact" && maxWidth && maxWidth) || undefined,
            }}
            className={cn(
              "text-center",
              "group-[.field-warning]:bg-warning",
              "group-[.field-error]:bg-destructive",
              type === "normal" && "text-foreground",
              type === "compact" &&
                "px-2 py-[2px] text-[0.6rem] leading-[0.8rem] text-white",
            )}
          >
            <p
              ref={ref}
              id={formMessageId}
              // className={cn("text-[0.8rem] font-medium")}
              {...props}
            >
              {bodyMessage}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
FormMessageTooltip.displayName = "FormMessageTooltip";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormFieldBase,
  FormItem,
  FormLabel,
  FormMessage,
  FormMessageTooltip,
  useFormField,
};
