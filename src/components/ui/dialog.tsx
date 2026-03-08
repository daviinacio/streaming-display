import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import Draggable from "react-draggable";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    role="overlay"
    className={cn(
      "overlay fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, draggable = false, ...props }, ref) => {
  // console.log("render");
  // @ts-ignore
  const isDraggable = props["data-draggable"];

  function stopPropagation(fn?: React.MouseEventHandler<HTMLDivElement>) {
    if (isDraggable) return fn;
    (e: React.MouseEvent) => {
      e.stopPropagation();
    };
  }

  return (
    <DialogPortal>
      {!isDraggable && <DialogOverlay />}

      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "max-w-full h-full fixed left-[50%] top-[50%] z-50 flex flex-col w-full sm:max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 sm:border-[3px] border-primary bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl overflow-hidden",
          className,
        )}
        {...props}
        onKeyDown={(e) => e.stopPropagation()}
        onMouseDown={stopPropagation(props.onMouseDown)}
        onMouseUp={stopPropagation(props.onMouseUp)}
      >
        {children}

        <DialogPrimitive.Close className="group absolute right-3 top-3 p-1 rounded-full ring-offset-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent text-white">
          <Cross2Icon
            className={cn(
              "w-5 h-5",
              "group-hover:scale-125 group-active:scale-110",
              "transition-[transform]",
            )}
          />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DraggableDialogContent = React.memo(
  ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<typeof DialogContent>) => {
    const stopPropagation = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    return (
      <div
        className="non-draggable"
        onMouseDown={stopPropagation}
        onMouseUp={stopPropagation}
      >
        <Draggable
          handle=".draggable-handle"
          cancel=".non-draggable"
          positionOffset={{ x: "-50%", y: "-50%" }}
        >
          <Slot
            className="w-full max-w-lg fixed shadow-2xl"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <DialogContent {...props} data-draggable>
              {children}
            </DialogContent>
          </Slot>
        </Draggable>
      </div>
    );
  },
);

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-0.5 text-center sm:text-left",
      "bg-primary text-primary-foreground -mx-6 px-6 -mt-6 py-4 draggable-handle",
      className,
    )}
    role="dialog-header"
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-2",
      "sm:flex-row-reverse sm:justify-start",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight flex items-center gap-2 flex-1",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-primary-foreground/70 w-fit", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
