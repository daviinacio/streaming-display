import { cn } from "@/lib/utils";
import { TrashIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
export type InputTextListProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  label?: string;
};

export function InputTextList({
  value,
  onChange,
  placeholder,
  label,
}: InputTextListProps) {
  const [open, setOpen] = useState(false);
  const valueText = value ? value[0] || "" : "";

  const [valueList, setValueList] = useState<string[]>([]);

  useEffect(() => {
    setValueList(value || [""]);
  }, [open, value]);

  useEffect(() => {
    const newValue = valueList.filter(
      (v, i, a) => v !== "" || i === a.length - 1
    );

    if (valueList.slice(-1)[0] !== "") {
      newValue.push("");
    }

    if (valueList.length !== newValue.length) setValueList(newValue);
  }, [valueList]);

  const handleRemoveItem = useCallback((index: number) => {
    setValueList((p) => p.filter((_, i) => i !== index));
  }, []);

  const handleChangeItem = useCallback((index: number, value: string) => {
    setValueList((p) => p.map((it, i) => (i === index ? value : it)));
  }, []);

  const handleUpdate = useCallback(() => {
    onChange && onChange(valueList.filter((v) => v !== ""));
    setOpen(false);
  }, [valueList]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start hover:bg-transparent",
            "border border-input  shadow-sm",
            "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
            open && "border-ring ring-1 ring-ring",
            "group-[.field-warning]:border-warning group-[.field-warning]:focus:ring-warning",
            "group-[.field-error]:border-destructive group-[.field-error]:focus:ring-destructive",

            valueText === "" && "!text-muted-foreground"
          )}
        >
          <span className="truncate">{valueText || placeholder}</span>
          {value && (
            <span
              className={cn(
                "bg-foreground text-background px-1 rounded-sm text-xs",
                "font-bold ml-1"
              )}
            >
              {value.length > 1 ? `+${value.length - 1}` : ""}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] h-full sm:h-[330px]">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>Create or edit a list of values</DialogDescription>
        </DialogHeader>
        <div className="-m-1 h-full flex flex-col">
          <ScrollArea fit scrollBarClassName="translate-x-2" type="scroll">
            <ValueListEdit
              placeholder={placeholder}
              valueList={valueList}
              onRemove={handleRemoveItem}
              onChange={handleChangeItem}
            />
          </ScrollArea>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          <Button type="button" onClick={handleUpdate}>
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type ValueListEditProps = {
  valueList: string[];
  onRemove?: (index: number) => void;
  onChange?: (index: number, value: string) => void;
  placeholder?: string;
};

export function ValueListEdit({
  valueList,
  onRemove,
  onChange,
  placeholder,
}: ValueListEditProps) {
  return (
    <div className="flex flex-col gap-2 p-1">
      {valueList.map((value, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => onChange && onChange(i, e.currentTarget.value)}
            placeholder={placeholder}
            iconPosition="right"
            icon={
              (onRemove && i !== valueList.length - 1 && (
                <Button
                  onClick={() => onRemove && onRemove(i)}
                  className={cn(
                    "h-7 w-7 pointer-events-auto",
                    "hover:text-destructive"
                  )}
                  variant="ghost"
                  size="icon"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              )) ||
              undefined
            }
          />
        </div>
      ))}
    </div>
  );
}
