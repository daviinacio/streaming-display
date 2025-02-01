import { cn } from "@/lib/utils";
import {
  Children,
  cloneElement,
  HTMLAttributes,
  ReactElement,
  useMemo,
} from "react";
import { GridItemProps } from "./grid-item";
import { GridItemPosition } from "@/lib/types";

type GridColumn = {
  index: number;
  length: number;
  weight: number;
};

export type GridProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactElement[];
  columns?: number;
  rows?: number;
};

export function Grid({
  children,
  className,
  columns = 5000,
  rows = 5000,
  ...props
}: GridProps) {
  const { columnsExtra, totalWeight } = useMemo(() => {
    const items = Children.map(
      children,
      (child) => child.props.item as GridItemProps["item"]
    );
    const columnsExtra: GridColumn[] = [];

    items.map((item) => {
      const column = columnsExtra.find((col) => col.index === item.column);

      if (column) {
        column.length += 1;
      } else {
        columnsExtra.push({
          index: item.column,
          weight: 1,
          length: 1,
        });
      }

      columnsExtra.sort((a, b) => a.index - b.index);
      if (columnsExtra.length >= 3) return columns;

      // Calculate the weight of each column
      columnsExtra.forEach((col) => {
        col.weight = items.length - col.length || 1;
      });
    });

    const totalWeight = columnsExtra.reduce(
      (ac, item) => (ac += item.weight),
      0
    );

    return {
      columnsExtra,
      totalWeight,
    };
  }, [children]);

  // console.log({ columnsExtra, totalWeight });

  return (
    <div className={cn("h-full bg-primary", className)} {...props}>
      <div
        className="h-full grid p-1 group/grid bg-background rounded-t-xl"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Children.map(children, (child) => {
          const props: GridItemProps = child.props;
          const item = props.item;

          const col = columnsExtra.find((col) => col.index === item.column);
          let position: GridItemPosition | undefined = undefined;

          if (col) {
            const colWidth = (columns / totalWeight) * col.weight;
            const itemHeight = rows / col.length;

            const totalWeightBefore = columnsExtra.reduce(
              (ac, item) => (item.index < col.index ? (ac += item.weight) : ac),
              0
            );

            const colX = (columns / totalWeight) * totalWeightBefore;

            position = {
              x: Math.trunc(colX),
              y: Math.trunc(itemHeight * item.row),
              width: Math.trunc(colWidth),
              height: Math.trunc(itemHeight),
            };
          }

          return cloneElement(child, {
            ...props,
            position,
            grid: {
              columns,
              rows,
            },
          } as GridItemProps);
        })}
      </div>
    </div>
  );
}
