import { z } from "zod";

export type JavascriptSchemaProps = {
  requiredReturns: string[];
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
            .map((p) => p.split("=")[0].trim())
        );
      }

      const resultObjectDefinitionIndex = Math.max(
        ...["$result =", "$result="].map((d) => nonCommentedJs.indexOf(d))
      );

      if (resultObjectDefinitionIndex !== -1) {
        let returnContent = nonCommentedJs
          .substring(resultObjectDefinitionIndex)
          .trim()
          .replace("$result", "")
          .trim()
          .substring(1)
          .trim();

        if (returnContent.startsWith("{"))
          returnContent = returnContent.slice(1).trim();
        if (returnContent.endsWith("}"))
          returnContent = returnContent.slice(0, -1).trim();
        if (returnContent.endsWith("};"))
          returnContent = returnContent.slice(0, -2).trim();

        returnContent
          .split(",")
          .map((r) => r.trim().split(":")[0].trim())
          .forEach((r) => returnedAttributes.push(r));
      }

      const missingAttributes = requiredReturns.filter(
        (at) => !returnedAttributes.includes(at)
      );

      if (missingAttributes.length > 0) {
        return ctx.addIssue({
          code: "custom",
          message: `Missing returning: ${missingAttributes.join(", ")}`,
        });
      }

      // const returnPart = js.substring(js.lastIndexOf("return"));
      // if (!returnPart.includes("{")) {
      //   return ctx.addIssue({
      //     code: "custom",
      //     message: "The resolver should return an object",
      //   });
      // }

      // const returnAttributes = (function () {
      //   let returnAttributes = returnPart.substring(
      //     returnPart.lastIndexOf("return")
      //   );
      //   returnAttributes = returnAttributes.substring(
      //     returnAttributes.indexOf("{") + 1
      //   );
      //   returnAttributes = returnAttributes.substring(
      //     0,
      //     returnAttributes.indexOf("}")
      //   );

      //   return returnAttributes.split(",").map((at) => at.split(":")[0].trim());
      // })();

      // const missingAttributes = requiredReturns.filter(
      //   (at) => !returnAttributes.includes(at)
      // );

      // if (missingAttributes.length > 0) {
      //   return ctx.addIssue({
      //     code: "custom",
      //     message: `Missing returning: ${missingAttributes.join(", ")}`,
      //   });
      // }
    });
}
