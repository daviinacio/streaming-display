import { cn } from "@/lib/utils";
import {
  Children,
  cloneElement,
  HTMLAttributes,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GridItemProps } from "./grid-item";
import { GridItem, GridItemPosition } from "@/lib/types";

type ItemPosition = GridItemPosition & {
  url: string;
};

export type GridProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactElement[];
  columns?: number;
  rows?: number;
};

export function Grid({ children, className, ...props }: GridProps) {
  const [animate, setAnimate] = useState(true);

  const [joints, setJoints] = useState<{ [key: number]: number }>({});

  const columns = useMemo(() => {
    const items = Children.map(children, (c) => c.props.item as GridItem);
    return Object.entries(
      items.reduce((acc, item) => {
        acc[item.column] = acc[item.column] || [];
        acc[item.column].push({
          row: item.row,
          url: item.url,
        });
        return acc;
      }, {} as { [key: number]: [{ url: string; row: number }] })
    );
  }, [children]);

  const columnsDimensions = useMemo(() => {
    return columns
      .toSorted(([a], [b]) => (parseInt(a) > parseInt(b) ? 0 : -1))
      .map(([_, rows], colIndex, columns) => {
        const hasNextColumn = columns.some((_, col) => col > colIndex);

        const jointStart = joints[colIndex - 1] || 0;
        const jointEnd = (hasNextColumn && joints[colIndex]) || 0;

        const colOriginalWidth = 100 / columns.length - jointStart;
        const colWidth = colOriginalWidth + jointEnd;
        const colX = (100 / columns.length) * colIndex + jointStart;

        return {
          joint: {
            position: colX + colOriginalWidth,
            offset: jointEnd,
          },
          width: colWidth,
          x: colX,
          rows: rows
            .toSorted((a, b) => (a.row > b.row ? 0 : -1))
            .map(({ url }, rowIndex) => {
              const rowY = (100 / rows.length) * rowIndex;
              const rowHeight = 100 / rows.length;

              return {
                url,
                y: rowY,
                height: rowHeight,
              };
            }),
        };
      });
  }, [columns, joints]);

  const itemsPosition = useMemo(() => {
    const itemsPosition: ItemPosition[] = [];
    for (let col of columnsDimensions) {
      for (let row of col.rows) {
        itemsPosition.push({
          url: row.url,
          x: col.x,
          width: col.width,
          y: row.y,
          height: row.height,
        });
      }
    }
    return itemsPosition;
  }, columnsDimensions);

  return (
    <div className={cn("h-full", className)} {...props}>
      <div className="h-full relative group/grid rounded-t-xl" role="grid">
        {Children.map(children, (child) => {
          return cloneElement(child, {
            ...child.props,
            grid: {
              count: Children.count(children),
            },
            animate,
            position: itemsPosition.find(
              (it) => it.url === child.props.item.url
            ),
          } as GridItemProps);
        })}

        {columnsDimensions.map(
          (col, i, a) =>
            i < a.length - 1 && (
              <Joint
                key={i}
                orientation="vertical"
                position={col.joint.position}
                offset={col.joint.offset}
                animate={animate}
                onDrag={(offset) => {
                  setAnimate(false);
                  setJoints((p) => ({
                    ...p,
                    [i]: offset,
                  }));
                }}
                onRelease={() => setAnimate(true)}
                onReset={() =>
                  setJoints((p) => ({
                    ...p,
                    [i]: 0,
                  }))
                }
              />
            )
        )}
      </div>
    </div>
  );
}

type JointProps = {
  orientation: "vertical" | "horizontal";
  position: number;
  offset: number;
  animate?: boolean;
  onDrag?: (offset: number) => void;
  onRelease?: () => void;
  onReset?: () => void;
};

function Joint({
  orientation,
  position,
  offset,
  animate,
  onDrag,
  onRelease,
  onReset,
}: JointProps) {
  const elemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!elemRef.current) return;

    function getDragXY(e: MouseEvent) {
      const pos = {
        x: 0,
        y: 0,
        xp: 0,
        yp: 0,
      };
      if (!elemRef.current) return pos;
      const grid = elemRef.current.parentElement;
      if (!grid) return pos;
      const bounding = grid.getBoundingClientRect();

      pos.x = e.clientX - bounding.left;
      pos.y = e.clientY - bounding.top;

      const { offsetWidth, offsetHeight } = grid;
      pos.xp = (pos.x / offsetWidth) * 100;
      pos.yp = (pos.y / offsetHeight) * 100;

      return pos;
    }

    // let isDragging = false;

    function handleMouseDown() {
      setIsDragging(true);
    }

    function mouseMode(e: MouseEvent) {
      if (!isDragging) return;
      const { xp, yp } = getDragXY(e);
      onDrag && onDrag(orientation === "vertical" ? xp - position : yp);
    }

    function mouseRelease() {
      setIsDragging(false);
      onRelease && onRelease();
    }

    elemRef.current.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", mouseMode);
    document.addEventListener("mouseup", mouseRelease);
    document.addEventListener("mouseleave", mouseRelease);

    return () => {
      elemRef.current?.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", mouseMode);
      document.removeEventListener("mouseup", mouseRelease);
      document.removeEventListener("mouseleave", mouseRelease);
    };
  }, [elemRef.current, position, isDragging]);

  return (
    <div
      role="grid-joint"
      ref={elemRef}
      onDoubleClick={() => onReset && onReset()}
      className={cn(
        "absolute z-10 opacity-0 hover:opacity-100",
        animate && "transition-[width,height,top,left, opacity] duration-300",
        orientation === "vertical" &&
          "top-0 bottom-0 w-2 translate-x-[-50%] cursor-col-resize",
        isDragging && "w-20"
      )}
      style={{
        ...(orientation === "vertical" && {
          left: `${position + offset}%`,
        }),
      }}
    ></div>
  );
}
