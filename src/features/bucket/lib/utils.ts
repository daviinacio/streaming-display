import { PaneNode, TreeNode } from "@/features/grid/types/tmux-grid";
import { generateId } from "@/lib/utils";
import { Bucket, BUCKET_URL_SCHEME, BucketSlotRef, BucketStream } from "../types";

export function isBucketUrl(url: string): boolean {
  return typeof url === "string" && url.startsWith(BUCKET_URL_SCHEME);
}

export function buildBucketUrl(bucketId: string, slotIndex: number): string {
  return `${BUCKET_URL_SCHEME}${bucketId}:${slotIndex}`;
}

export function parseBucketUrl(url: string): BucketSlotRef | null {
  if (!isBucketUrl(url)) return null;
  const rest = url.slice(BUCKET_URL_SCHEME.length);
  const [bucketId, slotIndexRaw] = rest.split(":");
  const slotIndex = Number(slotIndexRaw);
  if (!bucketId || Number.isNaN(slotIndex)) return null;
  return { bucketId, slotIndex };
}

export function createBucket(
  partial: Omit<Bucket, "id"> & { id?: string },
): Bucket {
  return {
    id: partial.id || generateId(),
    name: partial.name,
    slotCount: partial.slotCount,
    streams: partial.streams,
    layout: partial.layout,
  };
}

export function nextPriority(streams: { priority: number }[]): number {
  if (streams.length === 0) return 0;
  return Math.max(...streams.map((s) => s.priority)) + 1;
}

/**
 * Walks the tree in left-to-right top-to-bottom order, collecting panes.
 * Same traversal as flattenTree so slot indexing matches visual order.
 */
function collectPanes(node: TreeNode, acc: PaneNode[] = []): PaneNode[] {
  if (node.type === "pane") {
    acc.push(node);
  } else {
    collectPanes(node.first, acc);
    collectPanes(node.second, acc);
  }
  return acc;
}

/**
 * Transforms a working grid tree into a bucket layout: each non-empty pane
 * becomes a bucket-slot reference. Returns the layout and the streams list.
 */
export function buildBucketLayout(
  tree: TreeNode,
  bucketId: string,
): { layout: TreeNode; streams: BucketStream[] } {
  const panes = collectPanes(tree);
  const filled = panes.filter((p) => p.content);

  const streams: BucketStream[] = filled.map((p, i) => ({
    url: p.content,
    priority: filled.length - i,
  }));

  const transform = (node: TreeNode): TreeNode => {
    if (node.type === "pane") {
      const idx = filled.findIndex((fp) => fp.id === node.id);
      if (idx === -1) return { ...node };
      return { ...node, content: buildBucketUrl(bucketId, idx) };
    }
    return {
      ...node,
      first: transform(node.first),
      second: transform(node.second),
    };
  };

  return { layout: transform(tree), streams };
}

export function paneUrls(tree: TreeNode): string[] {
  return collectPanes(tree)
    .map((p) => p.content)
    .filter(Boolean);
}
