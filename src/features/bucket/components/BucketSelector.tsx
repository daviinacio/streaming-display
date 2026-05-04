import { HeaderButton } from "@/components/HeaderButton";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  FolderCogIcon,
  FolderIcon,
  FolderPlusIcon,
  PlusIcon,
} from "lucide-react";
import { useState } from "react";
import { useBuckets } from "../hooks/use-buckets";
import { AddStreamToBucketDialog } from "./AddStreamToBucketDialog";
import { BucketManagerDialog } from "./BucketManagerDialog";
import { SaveAsNewBucketDialog } from "./SaveAsNewBucketDialog";

export function BucketSelector() {
  const { list, activeBucket, activeBucketId, setActiveBucket } = useBuckets();
  const [open, setOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  const handleSelect = (id: string | null) => {
    setActiveBucket(id);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <span>
            <HeaderButton title={activeBucket?.name || "Buckets"}>
              <FolderIcon />
            </HeaderButton>
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-1 text-foreground"
          align="end"
          sideOffset={6}
        >
          <div className="px-2 pt-2 pb-1 text-xs uppercase tracking-wide text-muted-foreground">
            Active bucket
          </div>
          <BucketRow
            label="Free layout"
            checked={activeBucketId === null}
            onClick={() => handleSelect(null)}
          />
          {list.map((b) => (
            <BucketRow
              key={b.id}
              label={b.name}
              hint={`${b.slotCount} slots · ${b.streams.length} streams`}
              checked={activeBucketId === b.id}
              onClick={() => handleSelect(b.id)}
            />
          ))}
          <div className="border-t my-1" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => {
              setOpen(false);
              setSaveDialogOpen(true);
            }}
          >
            <FolderPlusIcon className="size-4" />
            Save current as new bucket
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => {
              setOpen(false);
              setAddDialogOpen(true);
            }}
          >
            <PlusIcon className="size-4" />
            Add stream to bucket
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => {
              setOpen(false);
              setManagerOpen(true);
            }}
          >
            <FolderCogIcon className="size-4" />
            Manage buckets
          </Button>
        </PopoverContent>
      </Popover>

      <SaveAsNewBucketDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />
      <AddStreamToBucketDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
      <BucketManagerDialog open={managerOpen} onOpenChange={setManagerOpen} />
    </>
  );
}

function BucketRow({
  label,
  hint,
  checked,
  onClick,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-2",
        "rounded-sm px-2 py-1.5 text-sm",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:bg-accent focus:text-accent-foreground",
      )}
    >
      <span className="flex flex-col items-start min-w-0">
        <span className="truncate">{label}</span>
        {hint && (
          <span className="text-xs text-muted-foreground truncate">{hint}</span>
        )}
      </span>
      {checked && <CheckIcon className="size-4 shrink-0" />}
    </button>
  );
}
