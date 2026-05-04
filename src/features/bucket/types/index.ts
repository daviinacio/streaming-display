import { TreeNode } from "@/features/grid/types/tmux-grid";

export interface BucketStream {
  url: string;
  priority: number;
}

export interface Bucket {
  id: string;
  name: string;
  slotCount: number;
  streams: BucketStream[];
  layout?: TreeNode;
}

export const BUCKET_URL_SCHEME = "bucket:";

export interface BucketSlotRef {
  bucketId: string;
  slotIndex: number;
}
