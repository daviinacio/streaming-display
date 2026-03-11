import { useMultiInstanceDrag } from "@/hooks/use-multi-instance-drag";
import { cn } from "@/lib/utils";
import {
  cloneElement,
  HTMLAttributes,
  ReactElement,
  useEffect,
  useRef,
} from "react";

export type DraggableProps = {
  disabled?: boolean;
  type?: string;
  value: string;
  ghost?: ReactElement;
} & HTMLAttributes<HTMLDivElement>;

export function Draggable({
  children,
  type = "url",
  value,
  disabled,
  ghost,
  ...props
}: DraggableProps) {
  const elemRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLElement>(null);
  const { notifyDrag } = useMultiInstanceDrag();

  useEffect(() => {
    if (!elemRef.current) return;

    function handleDragStart(e: DragEvent) {
      if (!e.dataTransfer || !elemRef.current || disabled) return;
      e.dataTransfer.setData(type, value);
      elemRef.current?.classList.add("dragging");

      if (ghostRef.current) {
        e.dataTransfer.setDragImage(
          ghostRef.current,
          20,
          ghostRef.current.offsetHeight / 2,
        );
      }
    }

    function handleDrag(e: DragEvent) {
      const outOfPage =
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight;

      notifyDrag({
        value,
        outOfPage,
      });
    }

    function handleDragEnd() {
      if (!elemRef.current) return;
      elemRef.current.classList.remove("dragging");
    }

    elemRef.current.addEventListener("dragstart", handleDragStart);
    elemRef.current.addEventListener("drag", handleDrag);
    elemRef.current.addEventListener("dragend", handleDragEnd);

    return () => {
      elemRef.current?.removeEventListener("dragstart", handleDragStart);
      elemRef.current?.removeEventListener("drag", handleDrag);
      elemRef.current?.removeEventListener("dragend", handleDragEnd);
    };
  }, [elemRef.current, ghostRef.current, type, value, disabled, ghost]);

  return (
    <>
      <div draggable={!disabled} ref={elemRef} role="draggable" {...props}>
        {children}
      </div>
      {ghost && (
        <div className="fixed top-[-200%] left-[-200%]">
          {cloneElement(ghost, {
            ...ghost.props,
            className: cn("z-[1000] relative", ghost.props.className),
            ref: ghostRef,
          })}
        </div>
      )}
    </>
  );
}
