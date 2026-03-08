import { Button } from "@/components/ui";
import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { PluginRawSchema } from "@/features/plugin/validation/plugin.schema";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { PluginComponentListItem } from "./PluginComponentListItem";

export interface PluginComponentListProps {
  onSelect: (index: number) => void;
  selected: number;
}

export function PluginComponentList({
  onSelect,
  selected,
}: PluginComponentListProps) {
  const form = useFormContext<PluginRawSchema>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components",
  });

  return (
    <div className="p-4 flex-1 flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground">
          Components
        </h3>
        <Button
          variant="ghost"
          className="size-6 p-0"
          onClick={() =>
            append({
              enabled: true,
              type: "Player",
              code: "",
              name: "",
              isEdit: true,
              isDirty: false,
            })
          }
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        {fields.map((_, i) => (
          <PluginComponentListItem
            key={i}
            index={i}
            className={cn(i === selected ? "font-semibold" : "tracking-wide")}
            onRemove={() => remove(i)}
            onSelect={() => onSelect(i)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save</Button>
      </div>
    </div>
  );
}
