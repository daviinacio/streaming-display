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
} from "@/components/ui";
import { Form, FormField } from "@/components/ui/form";
import { CodeEditor } from "@/components/widget";
import { useSourceHandlers } from "@/hooks/use-source-handlers";
import { normalizeIdentifier } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlayIcon } from "lucide-react";
import { PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { RunSourceHandlerDialog } from "./run-source-handler-dialog";
import { JavascriptSchema } from "@/lib/schema";

/**
 * @typedef {Object} Result
 * @property {string} title - Displayed title
 * @property {'success'|'error'|'unavailable'} status - Status of the streaming
 * @property {string} sourceUrl - Url to the source content
 *
 * @param {Object} props
 * @param {string} props.url Url provided by user
 *
 * @return {Result}
 */

const resolverOpening = "//###---OPEN---###//";
const resolverClosing = "//###---CLOSE---###//";

const editorTypescriptDefinition = `
  type Params =  {
    url: string
  };
  
  const $params: Params as const;

  type Result = {
    title: string;
    status: 'success'|'error'|'unavailable';
    sourceUrl: string;
  };

  let $result: Result;
`;

const defaultResolverJs = `const { url } = $params;

$result = {
  
};
`;

const SourceHandlerSchema = z.object({
  id: z.string().min(3, "Minimum of 3 characters"),
  label: z.string().min(3, "Minimum of 3 characters"),
  version: z.string().optional().default("1.0.0"), // TODO implement a version Input and Schema
  logo: z
    .object({
      url: z.string().url(),
      height: z.string().optional(),
    })
    .optional(),
  urlMatch: z.array(z.string()).min(1, "Required"),
  resolver: JavascriptSchema({
    transform: wrapSourceHandlerResolverJavascript,
    requiredReturns: ["title", "status", "sourceUrl"],
  }),
  allow: z.object({
    fullscreen: z.boolean().default(false),
    pip: z.boolean().default(false),
    refresh: z.boolean().default(false),
    volume: z.boolean().default(false),
  }),
  hidden: z.boolean().default(false),
});

export type SourceHandlerSchema = z.infer<typeof SourceHandlerSchema>;

const defaultValues: Partial<SourceHandlerSchema> = {
  label: "",
  id: "",
  allow: {
    fullscreen: true,
    pip: true,
    refresh: true,
    volume: true,
  },
};

export function wrapSourceHandlerResolverJavascript(resolverContent: string) {
  return `async ($params = {}) => {
    let $result = {};
    ${resolverOpening}${"\n"}${resolverContent}${"\n"}${resolverClosing}
    return $result;
  }`;
}

export function sourceHandlerSchemaToJavascript(data: SourceHandlerSchema) {
  const code =
    "export default " +
    JSON.stringify(
      {
        ...data,
        resolver: "$resolver",
      },
      undefined,
      2
    ).replace(
      '"$resolver"',
      wrapSourceHandlerResolverJavascript(data.resolver)
    );
  const encodedJs = encodeURIComponent(code);
  return "data:text/javascript;charset=utf-8," + encodedJs;
}

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
  const initialValues = useMemo<SourceHandlerSchema>(() => {
    const source = sh.getById(id);
    let resolver = source?.resolver.toString();

    if (resolver && resolver.indexOf(resolverOpening) >= 0) {
      resolver =
        resolver
          .substring(
            resolver.indexOf(resolverOpening) + resolverOpening.length,
            resolver.lastIndexOf(resolverClosing)
          )
          .trim() + "\n";
    }

    return {
      ...defaultValues,
      ...source,
      resolver: resolver || defaultResolverJs,
    };
  }, [id, open]);

  const form = useForm<SourceHandlerSchema>({
    resolver: zodResolver(SourceHandlerSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [initialValues]);

  const handleSubmit = useCallback(
    (data: SourceHandlerSchema) => {
      if (!id && sh.getById(data.id)) {
        form.setError("id", {
          message: "Id already taken",
        });
        return;
      }

      sh.save(data.id, sourceHandlerSchemaToJavascript(data));
      onOpenChange && onOpenChange(false);

      toast.success("Source handler successfully saved");
    },
    [sh, id]
  );

  useEffect(() => {
    if (id) return;
    form.setValue("id", normalizeIdentifier(form.watch("label")) || "", {
      shouldValidate: !!form.formState.errors["id"],
    });
  }, [form.watch("label")]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent
        className="sm:max-w-[700px] h-full sm:h-[700px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {id ? "Edit" : "Create"} custom source handler
          </DialogTitle>
          <DialogDescription>
            A source handler defines how to process and display content from a
            specific url.
          </DialogDescription>
        </DialogHeader>
        <Form
          form={form}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="h-full -m-1 flex flex-col"
        >
          <ScrollArea fit scrollBarClassName="translate-x-3">
            <div className="h-full flex flex-col gap-4 p-1">
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

              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="resolver"
                  label="Resolver function"
                  className="h-full"
                  action={
                    <div className="flex items-center gap-2">
                      <RunSourceHandlerDialog sourceHandler={form.watch()}>
                        <Button
                          variant="ghost"
                          className="p-0 pr-2 pl-1 h-fit gap-1"
                        >
                          <PlayIcon className="size-4 text-primary" />
                          <span className="text-sm">Run</span>
                        </Button>
                      </RunSourceHandlerDialog>
                      <FormField
                        control={form.control}
                        // className="mb-1"
                        name="hidden"
                        label="Hidden"
                      >
                        <Checkbox className="font-bold" />
                      </FormField>
                    </div>
                  }
                >
                  <CodeEditor
                    className="min-h-[200px]"
                    typescriptDefinition={editorTypescriptDefinition}
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
                    name="allow.volume"
                    label="Volume"
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
                    name="allow.pip"
                    label="Picture-in-picture"
                  >
                    <Checkbox />
                  </FormField>
                  <FormField
                    control={form.control}
                    className="flex-none"
                    name="allow.fullscreen"
                    label="Fullscreen"
                  >
                    <Checkbox />
                  </FormField>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button type="submit">Save</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
