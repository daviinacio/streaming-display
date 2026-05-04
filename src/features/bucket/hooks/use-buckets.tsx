import { TreeNode } from "@/features/grid/types/tmux-grid";
import { useLocalState } from "@daviapps/react-utils/hooks";
import {
  createContext,
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { Bucket, BucketStream } from "../types";
import { createBucket, nextPriority } from "../lib/utils";

export interface GridSnapshot {
  tree: TreeNode;
  urls: string[];
}

export interface BucketsContextState {
  list: Bucket[];
  activeBucketId: string | null;
  activeBucket: Bucket | null;
  setActiveBucket: (id: string | null) => void;
  create: (
    bucket: Omit<Bucket, "id"> & { id?: string },
  ) => Bucket;
  update: (id: string, patch: Partial<Bucket>) => void;
  remove: (id: string) => void;
  addStream: (bucketId: string, stream: BucketStream) => void;
  removeStream: (bucketId: string, url: string) => void;
  findById: (id: string) => Bucket | undefined;
  /** Registered by GridView; returns the current tree + visible URLs. */
  snapshotRef: MutableRefObject<(() => GridSnapshot | null) | null>;
}

const BucketsContext = createContext<BucketsContextState | null>(null);

export function useBuckets() {
  const ctx = useContext(BucketsContext);
  if (!ctx) throw new Error("BucketsProvider is required");
  return ctx;
}

export function BucketsProvider({ children }: PropsWithChildren) {
  const [list, setList] = useLocalState<Bucket[]>({
    key: "buckets",
    initialState: [],
  });
  const [activeBucketId, setActiveBucketIdRaw] = useLocalState<string | null>({
    key: "active-bucket",
    initialState: null,
  });
  const snapshotRef = useRef<(() => GridSnapshot | null) | null>(null);

  const setActiveBucket = useCallback<BucketsContextState["setActiveBucket"]>(
    (id) => setActiveBucketIdRaw(id),
    [setActiveBucketIdRaw],
  );

  const findById = useCallback(
    (id: string) => list.find((it) => it.id === id),
    [list],
  );

  const activeBucket = useMemo(
    () => (activeBucketId ? findById(activeBucketId) || null : null),
    [activeBucketId, findById],
  );

  const create = useCallback<BucketsContextState["create"]>(
    (input) => {
      const bucket = createBucket(input);
      setList((prev) => [...prev, bucket]);
      return bucket;
    },
    [setList],
  );

  const update = useCallback<BucketsContextState["update"]>(
    (id, patch) => {
      setList((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      );
    },
    [setList],
  );

  const remove = useCallback<BucketsContextState["remove"]>(
    (id) => {
      setList((prev) => prev.filter((it) => it.id !== id));
      if (activeBucketId === id) setActiveBucketIdRaw(null);
    },
    [setList, activeBucketId, setActiveBucketIdRaw],
  );

  const addStream = useCallback<BucketsContextState["addStream"]>(
    (bucketId, stream) => {
      setList((prev) =>
        prev.map((it) => {
          if (it.id !== bucketId) return it;
          if (it.streams.some((s) => s.url === stream.url)) return it;
          return { ...it, streams: [...it.streams, stream] };
        }),
      );
    },
    [setList],
  );

  const removeStream = useCallback<BucketsContextState["removeStream"]>(
    (bucketId, url) => {
      setList((prev) =>
        prev.map((it) =>
          it.id === bucketId
            ? { ...it, streams: it.streams.filter((s) => s.url !== url) }
            : it,
        ),
      );
    },
    [setList],
  );

  return (
    <BucketsContext.Provider
      value={{
        list,
        activeBucketId,
        activeBucket,
        setActiveBucket,
        create,
        update,
        remove,
        addStream,
        removeStream,
        findById,
        snapshotRef,
      }}
    >
      {children}
    </BucketsContext.Provider>
  );
}

export { nextPriority };
