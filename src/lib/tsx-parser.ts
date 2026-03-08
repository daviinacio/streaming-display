import * as React from "react";
import * as Babel from "@babel/standalone";

export interface TsxParserProps {
  dependencies?: Array<{
    name: string;
    content: any;
  }>;
}

export function TsxParser({ dependencies }: TsxParserProps) {
  const parse = async (code: string) => {
    const transpiledCode = Babel.transform(code, {
      filename: "dynamic.tsx",
      presets: ["react", "typescript", "env"],
      plugins: ["transform-modules-commonjs"],
    }).code;

    const getComponent = new Function(
      "exports",
      "React",
      ...(dependencies?.map((it) => it.name) || []),
      `
        ${transpiledCode}
        return exports.default;
      `,
    );

    const component = getComponent(
      {},
      React,
      ...(dependencies?.map((it) => it.content) || []),
    );

    return component;
  };

  return { parse };
}
