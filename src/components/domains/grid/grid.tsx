import { cn } from "@/lib/utils";
import {
  Children,
  cloneElement,
  HTMLAttributes,
  ReactElement,
  useMemo,
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
  const positions = useMemo((): ItemPosition[] => {
    const items = Children.map(children, (c) => c.props.item as GridItem);
    const positions: ItemPosition[] = [];

    const columns = items.reduce((acc, item) => {
      acc[item.column] = acc[item.column] || [];
      acc[item.column].push({
        row: item.row,
        url: item.url,
      });
      return acc;
    }, {} as { [key: number]: [{ url: string; row: number }] });

    Object.entries(columns)
      .toSorted(([a], [b]) => (parseInt(a) > parseInt(b) ? 0 : -1))
      .forEach(([_, rows], colIndex, columns) => {
        const colWidth = 100 / columns.length;
        const colX = colWidth * colIndex;
        rows
          .toSorted((a, b) => (a.row > b.row ? 0 : -1))
          .forEach(({ url }, rowIndex) => {
            positions.push({
              url,
              x: colX,
              width: colWidth,
              y: (100 / rows.length) * rowIndex,
              height: 100 / rows.length,
            });
          });
      });

    return positions;
  }, [children]);

  return (
    <div className={cn("h-full", className)} {...props}>
      <div className="h-full relative group/grid rounded-t-xl" role="grid">
        {Children.map(children, (child) => {
          return cloneElement(child, {
            ...child.props,
            position: positions.find((it) => it.url === child.props.item.url),
          } as GridItemProps);
        })}
      </div>
    </div>
  );
}
