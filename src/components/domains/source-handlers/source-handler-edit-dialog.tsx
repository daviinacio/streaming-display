import {
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  InputTextList,
  ScrollArea,
  Textarea,
} from "@/components/ui";
import { Form, FormField } from "@/components/ui/form";
import { useSourceHandlers } from "@/hooks/use-source-handlers";
import { normalizeIdentifier } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const defaultResolverJs = `async ({ url }) => {
  return {}
}
`;

const requiredReturns = ["title", "status", "sourceUrl"];

const SourceHandlerSchema = z.object({
  id: z.string().min(3, "Minimum of 3 characters"),
  label: z.string().min(5, "Minimum of 5 characters"),
  version: z.string().optional().default("v1.0.0"), //.min(1, "Required"), // TODO implement a version Input and Schema
  logo: z
    .object({
      url: z.string().url(),
      height: z.string().optional(),
    })
    .optional(),
  urlMatch: z.array(z.string()).min(1, "Required"),
  resolver: z
    .string()
    .min(1, "Required")
    .superRefine((js, ctx) => {
      try {
        eval(js);
      } catch (_) {
        return ctx.addIssue({
          code: "custom",
          message: "Invalid javascript",
        });
      }

      const returnPart = js.substring(js.lastIndexOf("return"));
      if (!returnPart.includes("{")) {
        return ctx.addIssue({
          code: "custom",
          message: "The resolver should return an object",
        });
      }

      const returnAttributes = (function () {
        let returnAttributes = returnPart.substring(
          returnPart.lastIndexOf("return")
        );
        returnAttributes = returnAttributes.substring(
          returnAttributes.indexOf("{") + 1
        );
        returnAttributes = returnAttributes.substring(
          0,
          returnAttributes.indexOf("}")
        );

        return returnAttributes.split(",").map((at) => at.split(":")[0].trim());
      })();

      const missingAttributes = requiredReturns.filter(
        (at) => !returnAttributes.includes(at)
      );

      if (missingAttributes.length > 0) {
        return ctx.addIssue({
          code: "custom",
          message: `Missing returning: ${missingAttributes.join(", ")}`,
        });
      }
    }),
  allow: z.object({
    fullscreen: z.boolean().default(false),
    pip: z.boolean().default(false),
    refresh: z.boolean().default(false),
    volume: z.boolean().default(false),
  }),
  hidden: z.boolean().default(false),
});

type SourceHandlerSchema = z.infer<typeof SourceHandlerSchema>;

export type SourceHandlerEditDialogProps = PropsWithChildren<{
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export function SourceHandlerEditDialog({
  id,
  children,
  open,
  onOpenChange,
}: SourceHandlerEditDialogProps) {
  const sh = useSourceHandlers();

  // @ts-ignore
  const defaultValues = useMemo<SourceHandlerSchema>(() => {
    const source = sh.getById(id);
    const resolver = source?.resolver.toString() || defaultResolverJs;
    return {
      ...{
        label: "",
        id: "",
      },
      ...source,
      resolver,
    };
  }, [id, open]);

  const form = useForm<SourceHandlerSchema>({
    resolver: zodResolver(SourceHandlerSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues]);

  const handleSubmit = useCallback(
    (data: SourceHandlerSchema) => {
      if (!id && sh.getById(data.id)) {
        form.setError("id", {
          message: "Id already taken",
        });
        return;
      }

      const javascriptCode =
        "export default " +
        JSON.stringify({
          ...data,
          resolver: "$resolver",
        }).replace('"$resolver"', data.resolver);

      sh.save(data.id, javascriptCode);
      onOpenChange && onOpenChange(false);

      toast.success("Source handler successfully saved");
    },
    [sh, id]
  );

  useEffect(() => {
    if (id) return;
    form.setValue("id", normalizeIdentifier(form.watch("label")) || "");
  }, [form.watch("label")]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent
        className="sm:max-w-[700px] h-full sm:h-[560px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{id ? "Edit" : "Create"} source handler</DialogTitle>
          <DialogDescription>TODO: type a description</DialogDescription>
        </DialogHeader>
        <Form
          form={form}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="h-full -m-1 flex flex-col"
        >
          <ScrollArea fit>
            <div className="h-full grid gap-4 p-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="label" label="Label">
                  <Input placeholder="Type a name" data-1p-ignore />
                </FormField>
                <FormField
                  control={form.control}
                  name="id"
                  label="Identifier"
                  warning={
                    id &&
                    form.formState.dirtyFields["id"] &&
                    "A new handler will be created"
                  }
                >
                  <Input
                    placeholder="Type a unique identifier"
                    data-1p-ignore
                  />
                </FormField>

                <FormField
                  control={form.control}
                  name="urlMatch"
                  label="Matches"
                  className="col-span-2 md:col-span-1"
                >
                  <InputTextList placeholder="https://example.com/*" />
                </FormField>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="resolver"
                  label="Resolver function"
                  action={
                    <FormField
                      control={form.control}
                      className="mb-1"
                      name="hidden"
                      label="Hidden"
                    >
                      <Checkbox className="font-bold" />
                    </FormField>
                  }
                >
                  <Textarea
                    data-1p-ignore
                    rows={12}
                    className="resize-none font-mono text-xs whitespace-pre"
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        document.execCommand("insertText", false, "  ");
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        document.execCommand("insertText", false, "\n");
                      }
                    }}
                  />
                </FormField>
              </div>

              <div>
                <h3 className="text-sm leading-none font-bold mt-1">
                  Allowed functionalities
                </h3>
                <div className="grid grid-cols-2 md:flex mt-3 gap-4 ">
                  <FormField
                    control={form.control}
                    className="flex-none"
                    name="allow.fullscreen"
                    label="Fullscreen"
                  >
                    <Checkbox />
                  </FormField>
                  <FormField
                    control={form.control}
                    className="flex-none"
                    name="allow.pip"
                    label="Picture-in-picture"
                  >
                    <Checkbox />
                  </FormField>
                  <FormField
                    control={form.control}
                    className="flex-none"
                    name="allow.refresh"
                    label="Refresh"
                  >
                    <Checkbox />
                  </FormField>
                  <FormField
                    control={form.control}
                    className="flex-none"
                    name="allow.volume"
                    label="Volume"
                  >
                    <Checkbox />
                  </FormField>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit">Submit</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
