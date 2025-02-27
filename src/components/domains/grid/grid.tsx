import { cn } from "@/lib/utils";
import {
  Children,
  cloneElement,
  HTMLAttributes,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GridItemProps } from "./grid-item";
import { GridItem, GridItemPosition } from "@/lib/types";
import { useTemporaryState } from "@/hooks/use-temporary-state";

type ItemPosition = GridItemPosition & {
  url: string;
};

export type GridProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactElement[];
  columns?: number;
  rows?: number;
};

const minWidth = 5;

export function Grid({ children, className, ...props }: GridProps) {
  const [animate, setAnimate] = useState(true);

  const [joints, setJoints] = useTemporaryState<number[]>("grid-joints", []);
  const [jointChangeHistory, setJointChangeHistory] = useTemporaryState<
    number[]
  >("grid-joint-change-history", []);

  const [shiftPressed, setShiftPressed] = useState(false);
  const [ctrlPressed, setCtrlPressed] = useState(false);

  useEffect(() => {
    function handleKeyEvent(e: globalThis.KeyboardEvent) {
      setShiftPressed(e.shiftKey);
      setCtrlPressed(e.ctrlKey);
    }

    document.addEventListener("keydown", handleKeyEvent);
    document.addEventListener("keyup", handleKeyEvent);
    return () => {
      document.removeEventListener("keydown", handleKeyEvent);
      document.removeEventListener("keyup", handleKeyEvent);
    };
  }, []);

  const pushJointChangeHistory = useCallback(
    (index: number) =>
      setJointChangeHistory((prev) => {
        if (prev.slice(-1)[0] === index) return prev;
        const result = [...prev].filter((v) => v !== index);
        result.push(index);
        return result;
      }),
    []
  );

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
    ).toSorted(([a], [b]) => (parseInt(a) > parseInt(b) ? 0 : -1));
  }, [children]);

  const adjustedJoints = useMemo(() => {
    const colOriginalWidth = 100 / columns.length;

    const history = jointChangeHistory; //.slice(-columns.length);
    const lastChanged = jointChangeHistory.slice(-1)[0];

    // console.log(lastChanged, history);

    const result: number[] = Array.from({ length: columns.length - 1 }).map(
      (_, i) => joints[i]
    );

    for (let i = 0; i < result.length; i++) {
      const lastAdjustedJoint = result[i - 1];
      // const lastJoint = joints[i - 1] || 0;

      // const lastJointHistoryIndex = history.indexOf(i - 1);
      // const currentJointHistoryIndex = history.indexOf(i);
      // const nextJointHistoryIndex = history.indexOf(i);

      // if (
      //   // lastChanged >= i ||
      //   lastJointHistoryIndex !== -1 &&
      //   currentJointHistoryIndex !== -1 &&
      //   lastJointHistoryIndex <= currentJointHistoryIndex
      // )
      //   continue;

      if (
        history.indexOf(lastChanged) !== -1 &&
        history.indexOf(i) !== -1 &&
        history.indexOf(lastChanged) <= history.indexOf(i)
        // (history.indexOf(history.slice(-2)[0]) !== -1 &&
        //   history.indexOf(i) !== -1 &&
        //   history.indexOf(history.slice(-2)[0]) <= history.indexOf(i))
        // (history.indexOf(i - 1) !== -1 &&
        //   history.indexOf(i) !== -1 &&
        //   history.indexOf(i - 1) < history.indexOf(i))
      )
        continue;

      // if (history.indexOf(lastChanged) <= history.indexOf(i)) continue;

      // const overlaps =
      //   lastJoint !== undefined &&
      //   result[i] - (lastJoint + colOriginalWidth) < -5;

      // console.log(i, overlaps);

      // const jsIndex = history.indexOf(i - 1);
      // const jeIndex = history.indexOf(i);

      // if (
      // jsIndex === -1 ||
      // jeIndex === -1 ||
      // jsIndex !== -1 &&
      // jeIndex !== -1 &&
      // jsIndex <= jeIndex
      //   ||
      // lastChanged >= i
      // )
      // continue;

      // if (
      //   history.indexOf(i - 1) !== -1 &&
      //   history.indexOf(i) !== -1 &&
      //   history.indexOf(i - 1) <= history.indexOf(i)
      // )
      //   continue;

      const value = Math.max(
        result[i] || 0,
        (lastAdjustedJoint || 0) - (colOriginalWidth - minWidth)
      );

      // console.log(i, {
      //   // ljd: (joints[i - 1] || 0) !== (result[i - 1] || 0),
      //   cjd: (joints[i] || 0) !== (value || 0),
      // });

      result[i] = value;
    }

    for (let i = result.length - 1; i >= 0; i--) {
      const nextAdjustedJoint = result[i + 1];
      result[i] = Math.min(
        result[i] || 0,
        (nextAdjustedJoint || 0) + (colOriginalWidth - minWidth)
      );
    }

    for (let i = 0; i < result.length; i++) {
      const lastAdjustedJoint = result[i - 1];

      result[i] = Math.max(
        result[i] || 0,
        (lastAdjustedJoint || 0) - (colOriginalWidth - minWidth)
      );
    }

    return result;
  }, [columns, joints, jointChangeHistory]);

  const columnsDimensions = useMemo(() => {
    return columns.map(([_, rows], colIndex, columns) => {
      const hasNextColumn = columns.some((_, col) => col === colIndex + 1);

      const jointStart = adjustedJoints[colIndex - 1] || 0;
      const jointEnd = (hasNextColumn && adjustedJoints[colIndex]) || 0;

      const colOriginalWidth = 100 / columns.length - jointStart;
      const colWidth = colOriginalWidth + jointEnd;
      const colX = (100 / columns.length) * colIndex + jointStart;

      return {
        joint: {
          offset: jointEnd,
          position: colX + colOriginalWidth,
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
  }, [columns, adjustedJoints]);

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
  }, [columnsDimensions]);

  const handleDragJoint = useCallback(
    (index: number, offset: number) => {
      setAnimate(false);
      pushJointChangeHistory(index);

      setJoints((p) => {
        if (ctrlPressed) {
          return adjustedJoints.map((j, i) => {
            if (i >= index) return offset;
            return j;
          });
        } else if (shiftPressed) {
          const length = adjustedJoints.length - index;
          return adjustedJoints.map((j, i) => {
            if (i >= index) return (offset / length) * (length - (i - index));
            return j;
          });
        } else {
          const result = [...p];
          result[index] = offset;
          return result;
        }
      });
    },
    [pushJointChangeHistory, shiftPressed, ctrlPressed, adjustedJoints]
  );

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
                onDrag={(offset) => handleDragJoint(i, offset)}
                onRelease={() => {
                  setAnimate(true);
                }}
                onReset={
                  () => setJoints([])
                  // setJoints((p) => ({
                  //   ...p,
                  //   [i]: 0,
                  // }))
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

    function handleMouseDown() {
      setIsDragging(true);
    }

    function handleMouseMove(e: MouseEvent) {
      if (!isDragging) return;
      const { xp, yp } = getDragXY(e);
      onDrag && onDrag(orientation === "vertical" ? xp - position : yp);
    }

    function handleMouseRelease() {
      setIsDragging(false);
      onRelease && onRelease();
    }

    elemRef.current.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseRelease);
    document.addEventListener("mouseleave", handleMouseRelease);

    return () => {
      elemRef.current?.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseRelease);
      document.removeEventListener("mouseleave", handleMouseRelease);
    };
  }, [elemRef.current, position, isDragging]);

  return (
    <div
      role="grid-joint"
      ref={elemRef}
      onDoubleClick={() => onReset && onReset()}
      onClick={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "absolute z-10",
        animate && "transition-[width,height,top,left, opacity] duration-300",
        orientation === "vertical" &&
          "top-0 bottom-0 w-2 translate-x-[-50%] cursor-col-resize",
        isDragging && "w-screen"
      )}
      style={{
        ...(orientation === "vertical" && {
          left: `${position + offset}%`,
        }),
      }}
    ></div>
  );
}
