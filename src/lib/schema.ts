import { z } from "zod";

export type JavascriptSchemaProps = {
  requiredReturns: string[];
};
export function JavascriptSchema({ requiredReturns }: JavascriptSchemaProps) {
  return z
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
    });
}
