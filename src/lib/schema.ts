import { z } from "zod/v3";
import { TsxParser } from "./tsx-parser";

export type JavascriptSchemaProps = {
  requiredReturns?: string[];
  transform?: (value: string) => string;
};
export function JavascriptSchema({
  requiredReturns = [],
  transform,
}: JavascriptSchemaProps) {
  return z
    .string()
    .min(1, "Required")
    .superRefine((js, ctx) => {
      try {
        eval(transform ? transform(js) : js);
      } catch (_) {
        return ctx.addIssue({
          code: "custom",
          message: "Invalid javascript",
        });
      }

      const nonCommentedJs = js
        .split("\n")
        .filter((line) => !line.trim().startsWith("//"))
        .join("\n");

      let returnedAttributes: string[] = [];

      if (nonCommentedJs.includes("$result.")) {
        returnedAttributes.push(
          ...nonCommentedJs
            .split("$result.")
            .slice(1)
            .map((p) => p.split("=")[0].trim()),
        );
      }

      const resultObjectDefinitionIndex = Math.max(
        ...["$result =", "$result=" /*, "return"*/].map((d) =>
          nonCommentedJs.indexOf(d),
        ),
      );

      if (resultObjectDefinitionIndex !== -1) {
        nonCommentedJs
          .substring(resultObjectDefinitionIndex + 9)
          .trim()
          .replace(/[{};]/g, "")
          .trim()
          .split(",")
          .map((r) => r.trim().split(":")[0].trim())
          .forEach((r) => returnedAttributes.push(r));
      }

      const missingAttributes = requiredReturns.filter(
        (at) => !returnedAttributes.includes(at),
      );

      if (missingAttributes.length > 0) {
        return ctx.addIssue({
          code: "custom",
          message: `Missing returning: ${missingAttributes.join(", ")}`,
        });
      }
    });
}

export const TypesScriptSchema = z
  .string()
  .min(1, "Required")
  .superRefine(async (ts, ctx) => {
    try {
      const component = await TsxParser({}).parse(ts);
      if (!component) throw new Error("");
    } catch (_) {
      return ctx.addIssue({
        code: "custom",
        message: "Invalid typescript",
      });
    }
  });
