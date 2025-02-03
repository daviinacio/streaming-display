import { TextareaProps } from "@/components/ui";
import { usePreference } from "@/hooks/use-preference";
import { useTheme } from "@/hooks/use-theme";
import { cn, hslToHex } from "@/lib/utils";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";

export type CodeEditorProps = Omit<TextareaProps, "onChange"> & {
  onChange?: (value?: string) => void;
  language?: string;
  typescriptDefinition?: string;
};

export function CodeEditor({
  defaultValue,
  value,
  language = "javascript",
  typescriptDefinition,
  className,
  ...props
}: CodeEditorProps) {
  const theme = useTheme();
  const monaco = useMonaco();
  const preferences = usePreference();
  const currentColorPrimary = preferences.getItem("color-primary");
  const currentColorPrimaryHex = hslToHex(currentColorPrimary);

  useEffect(() => {
    if (!monaco) return;
    monaco.editor.defineTheme("editor-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.selectionBackground": `${currentColorPrimaryHex}50`,
        "editor.selectionHighlight": currentColorPrimaryHex,
      },
    });

    monaco.editor.defineTheme("editor-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
      },
    });

    try {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        typescriptDefinition,
        "myDefault:some.file.d.ts"
      );
    } catch (err) {}
  }, [monaco]);

  if (!monaco) return;

  return (
    <Editor
      {...props}
      value={typeof value == "string" ? value : ""}
      defaultValue={typeof defaultValue == "string" ? defaultValue : ""}
      language={language}
      theme={theme.isDarkMode ? "editor-dark" : "editor-light"}
      className={cn(
        //"ring ring-primary rounded-sm overflow-hidden",
        "transition-colors",
        "border border-input shadow-sm rounded-md overflow-hidden",
        // "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
        "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ring",
        "group-[.field-warning]:border-warning group-[.field-warning]:focus:ring-warning",
        "group-[.field-error]:border-destructive group-[.field-error]:focus:ring-destructive",
        "group-[.field-error]:border-destructive group-[.field-error]:has-[:focus-visible]:ring-destructive",
        className
      )}
      options={{
        ligature: true,
        tabSize: 2,
        inlineSuggest: true,
        fontSize: "14px",
        formatOnType: true,
        autoClosingBrackets: true,
        minimap: { enabled: false },
      }}
    />
  );
}
