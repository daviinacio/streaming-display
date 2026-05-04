import { usePlugin } from "@/features/plugin";
import { mergeDefined } from "@/lib/utils";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { Bucket } from "../types";

const BUCKET_REFETCH_INTERVAL = 30 * 1000;

function defaultSourceHandler({ src }: { src: string }) {
  return { sourceUrl: src };
}

export interface BucketSlotsResult {
  /** URLs assigned to each slot (length = bucket.slotCount). */
  slots: Array<string | null>;
  /** Online URLs in priority order, capped to slotCount. */
  online: string[];
  /** All bucket URLs by online status. */
  status: Record<string, "online" | "offline" | "pending">;
}

export function useBucketSlots(
  bucket: Bucket | null | undefined,
): BucketSlotsResult {
  const { findComponentByUrl } = usePlugin();
  const streams = bucket?.streams || [];

  const queries = useQueries({
    queries: streams.map((s) => {
      const handlers = findComponentByUrl(s.url, "source_handler");
      return {
        queryKey: ["handler", s.url, `${handlers.length}_handlers`],
        queryFn: () =>
          Promise.all(
            [defaultSourceHandler, ...handlers].map((fn) =>
              fn({ src: s.url }),
            ),
          ).then((results) =>
            results.reduce<any>((acc, it) => {
              if (acc === undefined) return mergeDefined({}, it);
              return mergeDefined(acc, it);
            }, undefined),
          ),
        refetchInterval: BUCKET_REFETCH_INTERVAL,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        retry: false,
      };
    }),
  });

  return useMemo<BucketSlotsResult>(() => {
    if (!bucket) return { slots: [], online: [], status: {} };

    const status: BucketSlotsResult["status"] = {};
    streams.forEach((s, i) => {
      const q = queries[i];
      if (!q) {
        status[s.url] = "pending";
      } else if (q.isError) {
        status[s.url] = "offline";
      } else if (q.data) {
        status[s.url] = "online";
      } else {
        status[s.url] = "pending";
      }
    });

    // Treat "pending" as online so slots fill on first load (optimistic).
    const onlineUrls = [...streams]
      .filter((s) => status[s.url] !== "offline")
      .sort((a, b) => b.priority - a.priority)
      .map((s) => s.url);

    const online = onlineUrls.slice(0, bucket.slotCount);
    const slots: Array<string | null> = Array.from(
      { length: bucket.slotCount },
      (_, i) => online[i] ?? null,
    );

    return { slots, online, status };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, streams.map((s) => `${s.url}|${s.priority}`).join(","), queries.map((q) => `${q.status}|${!!q.data}`).join(",")]);
}
