import { TextareaProps } from "@/components/ui";
import { usePreference } from "@/hooks/use-preference";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import Editor, { OnMount, useMonaco } from "@monaco-editor/react";
import Color from "color";
import { useCallback } from "react";

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
  const [colorPrimary] = usePreference("color-primary");
  const currentColorPrimary = Color(`hsl(${colorPrimary})`);

  // useEffect(() => {
  //   if (!monaco) return;
  //   monaco.editor.defineTheme("editor-dark", {
  //     base: "vs-dark",
  //     inherit: true,
  //     rules: [],
  //     colors: {
  //       "editor.selectionBackground": currentColorPrimary.alpha(0.32).hexa(),
  //       "editor.selectionHighlight": currentColorPrimary.hexa(),
  //       "editor.background": "#09090b",
  //     },
  //   });

  //   monaco.editor.defineTheme("editor-light", {
  //     base: "vs",
  //     inherit: true,
  //     rules: [],
  //     colors: {
  //       "editor.background": "#ffffff",
  //     },
  //   });

  //   try {
  //     // const babelParse = (code: string) =>
  //     //   parse(code, {
  //     //     sourceType: "module",
  //     //     plugins: ["jsx"],
  //     //   });

  //     // const monacoJSXHighlighter = new MonacoJSXHighlighter(
  //     //   monaco,
  //     //   babelParse,
  //     //   traverse,
  //     //   monaco.editor,
  //     // );

  //     // monacoJSXHighlighter.highlightOnDidChangeModelContent(100);
  //     // monacoJSXHighlighter.addJSXCommentCommand();

  //     const controller = new MonacoJsxSyntaxHighlight(getWorker(), monaco);

  //     monaco.languages.typescript.javascriptDefaults.addExtraLib(
  //       typescriptDefinition,
  //       "myDefault:some.file.d.ts",
  //     );
  //     // monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  //     //   jsx: monaco.languages.typescript.JsxEmit.Preserve,
  //     //   target: monaco.languages.typescript.ScriptTarget.ES2025,
  //     // });
  //     monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  //       jsx: monaco.languages.typescript.JsxEmit.React,
  //       jsxFactory: "React.createElement",
  //       reactNamespace: "React",
  //       allowJs: true,
  //       target: monaco.languages.typescript.ScriptTarget.ESNext,
  //     });
  //   } catch (err) {}
  // }, [monaco]);

  const handleOnEditorMount = useCallback<OnMount>((editor, monaco) => {
    monaco.editor.defineTheme("editor-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.selectionBackground": currentColorPrimary.alpha(0.32).hexa(),
        "editor.selectionHighlight": currentColorPrimary.hexa(),
        "editor.background": "#09090b",
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

    // 1. Definições de Tipos para Autocomplete (React Events + HTML)
    const reactTypes = `
    declare namespace JSX {
      interface IntrinsicElements {
        [elem: string]: HTMLAttributes;
      }
      interface HTMLAttributes extends DOMAttributes {
        className?: string;
        id?: string;
        style?: any;
        children?: any;
      }
      interface DOMAttributes {
        onClick?: (event: any) => void;
        onMouseEnter?: (event: any) => void;
        onMouseLeave?: (event: any) => void;
        onMouseDown?: (event: any) => void;
        onMouseUp?: (event: any) => void;
        onChange?: (event: any) => void;
        onSubmit?: (event: any) => void;
        onKeyDown?: (event: any) => void;
        onKeyUp?: (event: any) => void;
        onFocus?: (event: any) => void;
        onBlur?: (event: any) => void;
      }
    }
  `;

    // 2. Configuração do Compilador e Injeção de Tipos
    const compilerOptions = {
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: "React.createElement",
      reactNamespace: "React",
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
    };

    [
      monaco.languages.typescript.javascriptDefaults,
      monaco.languages.typescript.typescriptDefaults,
    ].forEach((def) => {
      def.setCompilerOptions(compilerOptions);
      def.addExtraLib(reactTypes, "react-internal.d.ts");

      // Mantemos as validações para que o autocomplete seja priorizado
      def.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    });

    // 3. Melhorar a velocidade de sugestão do Editor
    editor.updateOptions({
      suggestOnTriggerCharacters: true,
      quickSuggestions: { other: true, comments: false, strings: true },
      formatOnPaste: true,
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
    });

    // 4. Inicialização do Highlighter (Highlighter + Babel)
    (async () => {
      try {
        // Polyfill do Buffer para o Babel
        if (typeof window !== "undefined" && !window.Buffer) {
          const { Buffer } = await import("buffer");
          window.Buffer = Buffer;
        }

        // Imports dinâmicos
        const { parse } = await import("@babel/parser");
        const traverse = (await import("@babel/traverse")).default;
        // @ts-ignore
        const MonacoJSXHighlighter = (await import("monaco-jsx-highlighter"))
          .default;

        const babelParse = (code: string) =>
          parse(code, {
            sourceType: "module",
            plugins: ["jsx"],
          });

        const monacoJSXHighlighter = new MonacoJSXHighlighter(
          monaco,
          babelParse,
          traverse,
          editor,
        );

        // Inicia o realce
        monacoJSXHighlighter.highlightOnDidChangeModelContent();
        monacoJSXHighlighter.addJSXCommentCommand();
      } catch (error) {
        console.error("Erro no JSX Highlighter:", error);
      }
    })();
  }, []);

  if (!monaco) return;

  return (
    <div
      className="inline"
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onInput={(e) => e.stopPropagation()}
    >
      <Editor
        {...props}
        value={typeof value == "string" ? value : ""}
        defaultValue={typeof defaultValue == "string" ? defaultValue : ""}
        language={language}
        theme={theme.isDarkMode ? "editor-dark" : "editor-light"}
        onMount={handleOnEditorMount}
        className={cn(
          //"ring ring-primary rounded-sm overflow-hidden",
          "transition-colors",
          "border border-input shadow-sm rounded-md overflow-hidden",
          // "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
          "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ring",
          "group-[.field-warning]:border-warning group-[.field-warning]:focus:ring-warning",
          "group-[.field-error]:border-destructive group-[.field-error]:focus:ring-destructive",
          "group-[.field-error]:border-destructive group-[.field-error]:has-[:focus-visible]:ring-destructive",
          "min-h-[200px]",
          className,
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
    </div>
  );
}
