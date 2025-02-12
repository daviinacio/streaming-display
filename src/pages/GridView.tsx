import {
  DropArea,
  DropLocation,
} from "@/components/domains/drag-n-drop/drop-area";
import { Grid } from "@/components/domains/grid/grid";
import { VideoPlayer } from "@/components/domains/video/video-player";
import { useMultiInstanceDrag } from "@/hooks/use-multi-instance-drag";
import { useSourceHandlers } from "@/hooks/use-source-handlers";
import { useTemporaryState } from "@/hooks/use-temporary-state";
import { GridItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

export default function GridViewPage() {
  const sh = useSourceHandlers();
  const [gridItems, setGridItems] = useTemporaryState<GridItem[]>(
    "grid-items",
    []
  );

  const [gridItemsHistory, setGridItemsHistory] = useTemporaryState<
    GridItem[][]
  >("grid-items-history", [[]]);

  useEffect(() => {
    if (
      gridItems.length > 0 &&
      (gridItemsHistory.length === 0 || gridItemsHistory[0].length === 0)
    )
      setGridItemsHistory([gridItems]);
  }, [gridItems, gridItemsHistory]);

  const pushGridItemsHistory = useCallback((gridItems: GridItem[]) => {
    setGridItemsHistory((prev) => {
      const result = [...prev];
      result.push(gridItems);
      return result;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setGridItemsHistory((p) => {
      if (p.length <= 1) return p;
      const history = [...p].slice(0, -1);
      setGridItems(history.slice(-1)[0]);
      return history;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

  // useEffect(() => {
  //   const direction = true;
  //   // TODO: Implement keyboard shortcut for flip items position
  //   setTimeout(() => {
  //     // Flip items
  //     setGridItems((prev) => {
  //       const sorted = prev
  //         .map((p) => ({ ...p }))
  //         .toSorted((a, b) => (a.row >= b.row ? 0 : -1))
  //         .toSorted((a, b) => (a.column >= b.column ? 0 : -1));
  //       const gridItems = sorted.map((p) => ({ ...p }));
  //       // const result =;
  //       sorted.forEach((_, i, a) => {
  //         const ni = (i + 1) % a.length;
  //         gridItems[direction ? i : ni].row = a[direction ? ni : i].row;
  //         gridItems[direction ? i : ni].column = a[direction ? ni : i].column;
  //       });

  //       return gridItems;
  //     });
  //   }, 100);
  // }, []);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | undefined = undefined;

    navigator.wakeLock.request("screen").then((value) => {
      console.debug("Wake locked");
      wakeLock = value;
    });

    return () => {
      wakeLock &&
        wakeLock.release().then(() => console.debug("Wake lock released"));
    };

    // try {
    //   wakeLock = await navigator.wakeLock.request("screen");
    //   statusElem.textContent = "Wake Lock is active!";
    // } catch (err) {
    //   // The Wake Lock request has failed - usually system related, such as battery.
    //   statusElem.textContent = `${err.name}, ${err.message}`;
    // }
  }, []);

  const freeUpRow = useCallback(
    (
      gridItems: GridItem[],
      column: number,
      row: number,
      direction: boolean
    ) => {
      gridItems
        .filter(
          (gi) =>
            gi.column === column && (direction ? gi.row >= row : gi.row <= row)
        )
        .forEach((gi) => {
          gi.row += direction ? 1 : -1;
        });
    },
    []
  );

  const freeUpColumn = useCallback(
    (gridItems: GridItem[], column: number, direction: boolean) => {
      gridItems
        .filter((gi) => (direction ? gi.column >= column : gi.column <= column))
        .forEach((gi) => {
          gi.column += direction ? 1 : -1;
        });
    },
    []
  );

  const handleRemove = useCallback((url: string) => {
    setGridItems((prev) => {
      const result = prev.filter((p) => p.url !== url);
      pushGridItemsHistory(result);
      return result;
    });
  }, []);

  const handleDrop = useCallback(
    (
      url: string,
      location: DropLocation,
      currentUrl?: string,
      moving?: boolean
    ) => {
      setGridItems((prev) => {
        const gridItems = prev.map((p) => ({ ...p }));

        if (!moving && gridItems.some((gi) => gi.url === url)) {
          toast.error("URL already in the grid");
          return gridItems;
        }

        const handler = sh.findHandler(url);
        if (!handler) {
          toast.error("There's no handler available for this URL");
          return gridItems;
        }

        const urlItem = gridItems.find((it) => it.url === url);
        const currentItem = gridItems.find((it) => it.url === currentUrl);

        if (!currentItem) {
          gridItems.push({ url, column: 0, row: 0 });
          pushGridItemsHistory(gridItems);
          return gridItems;
        }

        const tempCurrentItem = { ...currentItem };

        if (location === "center" && urlItem) {
          currentItem.column = urlItem.column;
          currentItem.row = urlItem.row;
          urlItem.column = tempCurrentItem.column;
          urlItem.row = tempCurrentItem.row;
        } else if (location === "center") {
          currentItem.url = url;
        } else if (location === "left" && urlItem) {
          const column = currentItem.column - 1;
          freeUpColumn(gridItems, column, false);
          urlItem.column = column;
          urlItem.row = 0;
        } else if (location === "left") {
          const column = currentItem.column - 1;
          freeUpColumn(gridItems, column, false);
          gridItems.push({
            url,
            column,
            row: 0,
          });
        } else if (location === "right" && urlItem) {
          const column = currentItem.column + 1;
          freeUpColumn(gridItems, column, true);
          urlItem.column = column;
          urlItem.row = 0;
        } else if (location === "right") {
          const column = currentItem.column + 1;
          freeUpColumn(gridItems, column, true);
          gridItems.push({
            url,
            column,
            row: 0,
          });
        } else if (location === "top" && urlItem) {
          const row = currentItem.row - 1;
          freeUpRow(gridItems, currentItem.column, row, false);
          urlItem.column = currentItem.column;
          urlItem.row = row;
        } else if (location === "top") {
          const row = currentItem.row - 1;
          freeUpRow(gridItems, currentItem.column, row, false);
          gridItems.push({
            url,
            column: currentItem.column,
            row,
          });
        } else if (location === "bottom" && urlItem) {
          const row = currentItem.row + 1;
          freeUpRow(gridItems, currentItem.column, row, true);
          urlItem.column = currentItem.column;
          urlItem.row = row;
        } else if (location === "bottom") {
          const row = currentItem.row + 1;
          freeUpRow(gridItems, currentItem.column, row, true);
          gridItems.push({
            url,
            column: currentItem.column,
            row,
          });
        }

        pushGridItemsHistory(gridItems);
        return gridItems;
      });
    },
    [sh, sh.custom]
  );

  useMultiInstanceDrag({
    onDrop(url, swapUrl) {
      if (gridItems.every((gi) => gi.url !== url)) return false;

      if (!swapUrl) {
        handleRemove(url);
        return true;
      }

      if (gridItems.some((gi) => gi.url === swapUrl)) return false;

      setGridItems((prev) => {
        const gridItems = prev.map((p) => ({ ...p }));
        const urlItem = gridItems.find((it) => it.url === url);
        if (!urlItem) return prev;
        urlItem.url = swapUrl;
        return gridItems;
      });
      return true;
    },
  });

  return (
    <div className="h-full bg-primary">
      <DropArea
        onDrop={(url, location, moving) =>
          handleDrop(url, location, undefined, moving)
        }
        onlyCenter={true}
        className={cn(
          "bg-background rounded-t-xl p-0 shadow-md shadow-black",
          gridItems.length === 0 && "p-1"
        )}
        disabled={gridItems.length > 0}
      >
        {gridItems.length > 0 && (
          <Grid>
            {gridItems.map((it) => (
              <VideoPlayer
                key={it.url}
                item={it}
                onDrop={handleDrop}
                onRemove={handleRemove}
              />
            ))}
          </Grid>
        )}
      </DropArea>
    </div>
  );
}
