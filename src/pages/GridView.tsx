import { Grid } from "@/components/domains/grid/grid";
import { VideoPlayer } from "@/components/domains/video/video-player";
import { GridItem } from "@/lib/types";
import { useEffect, useState } from "react";

export default function GridViewPage() {
  // const sh = useSourceHandlers();
  const [gridItems, setGridItems] = useState<GridItem[]>([]);

  // const handleAddItem = useCallback(
  //   (url: string) => {
  //     try {
  //       if (gridItems.some((gi) => gi.url === url))
  //         throw new Error("URL already in the grid");

  //       const handler = sh.findHandler(url);
  //       if (!handler)
  //         throw new Error("There's no handler available for this URL");

  //       const item: GridItem = {
  //         column: 1,
  //         row: 1,
  //         sourceHandlerId: handler.id,
  //         url,
  //       };

  //       setGridItems((p) => {
  //         return [...p, item];
  //       });
  //     } catch (err) {
  //       if (err instanceof Error) {
  //         toast.error(err.message);
  //       }
  //     }
  //   },
  //   [sh, gridItems]
  // );

  useEffect(() => {
    const direction = true;
    setTimeout(() => {
      // Flip items
      setGridItems((prev) => {
        const result = prev.map((p) => ({ ...p }));
        prev.forEach((_, i, a) => {
          const ni = (i + 1) % a.length;
          result[direction ? i : ni].row = a[direction ? ni : i].row;
          result[direction ? i : ni].column = a[direction ? ni : i].column;
        });
        return result;
      });
    }, 100);
  }, []);

  return (
    <Grid>
      {gridItems.map((it) => (
        <VideoPlayer key={it.url} item={it} />
      ))}
    </Grid>
  );
}
