import { Button, Input } from "@/components/ui";
import { HTMLAttributes, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { FormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PluginRawSchema } from "@/features/plugin/validation/plugin.schema";
import useAlertDialog from "@/hooks/use-alert-dialog";
import useClickOutside from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";
import { Trash2Icon } from "lucide-react";
import { PLUGIN_COMPONENT_DEFAULT_CODE } from "../constants/plugin-component-default-code";
import { PLUGIN_TYPE_OPTIONS } from "../constants/plugin-type.options";
import { Switch } from "@/components/ui/switch";

interface PluginComponentListItemProps extends HTMLAttributes<HTMLDivElement> {
  index: number;
  onRemove: () => void;
  onSelect: () => void;
}

export function PluginComponentListItem({
  index,
  onRemove,
  onSelect,
  className,
  ...props
}: PluginComponentListItemProps) {
  const form = useFormContext<PluginRawSchema>();
  const alert = useAlertDialog();

  const { name, isEdit, isDirty } = form.watch(`components.${index}`) || {};

  const [isSelectTypeOpen, setIsSelectTypeOpen] = useState(!isDirty);

  function setIsEdit(v: boolean) {
    form.setValue(`components.${index}.isEdit`, v);
  }

  function setIsDirty(v: boolean) {
    form.setValue(`components.${index}.isDirty`, v);
  }

  const wrapperRef = useClickOutside(() => {
    if (!isEdit || isSelectTypeOpen) return;

    if (name !== "") {
      setIsEdit(false);
      setIsDirty(true);
    } else if (!isDirty) {
      return onRemove();
    }
  });

  useEffect(() => {
    if (form.watch(`components.${index}.name`) === "") {
      form.setValue(
        `components.${index}.name`,
        (
          PLUGIN_TYPE_OPTIONS[
            form.watch(`components.${index}.type`) as PLUGIN_TYPE_OPTIONS
          ] || {}
        ).label || "",
      );
    }
  }, [form.watch(`components.${index}.type`)]);

  useEffect(() => {
    if (!form.watch(`components.${index}.code`)) {
      form.setValue(
        `components.${index}.code`,
        PLUGIN_COMPONENT_DEFAULT_CODE[
          form.watch(`components.${index}.type`) as PLUGIN_TYPE_OPTIONS
        ],
      );
    }
  }, [form.watch(`components.${index}.type`)]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "flex items-center gap-2",
        !isEdit && "cursor-pointer *:cursor-pointer",
        className,
      )}
      onDoubleClick={() => setIsEdit(true)}
      onClick={() => !isEdit && onSelect()}
      {...props}
    >
      <FormField
        control={form.control}
        name={`components.${index}.enabled`}
        className="max-w-9"
      >
        <Switch size="sm" />
      </FormField>

      <FormField
        control={form.control}
        name={`components.${index}.type`}
        className="max-w-4 w-4"
      >
        <Select
          disabled={!isEdit}
          open={isSelectTypeOpen}
          onOpenChange={setIsSelectTypeOpen}
        >
          <SelectTrigger
            className={cn(
              "w-full border-0 !ring-0 shadow-none p-0 !opacity-100 [&>svg]:hidden",
            )}
          >
            <SelectValue className="" placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent className="max-w-48">
            <SelectGroup>
              <SelectLabel>Type</SelectLabel>
              {Object.entries(PLUGIN_TYPE_OPTIONS).map(
                ([value, { icon: Icon, label }]) => (
                  <SelectItem value={value} key={value}>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 min-w-4" />{" "}
                      <span className="">{label}</span>
                    </div>
                  </SelectItem>
                ),
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormField>

      <FormField control={form.control} name={`components.${index}.name`}>
        <Input
          placeholder="Component name ..."
          className={cn(
            "!ring-0 border-0 !shadow-none !p-0 h-fit",
            !isEdit && "cursor-pointer",
          )}
          readOnly={!isEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setIsEdit(false);
            }
          }}
        />
      </FormField>
      <Button
        className={cn("p-0 size-6 ", (!isEdit || !isDirty) && "hidden")}
        variant="ghost"
        onClick={() =>
          alert
            .confirm("Delete component", "Are you sure?")
            .then((r) => r && onRemove())
        }
      >
        <Trash2Icon className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
