import { z } from "zod/v3";
import { parsePluginComponent } from "../lib/parse-plugin-component";

export const PluginRawSchema = z.object({
  enabled: z.boolean().default(true),
  id: z.string(),
  name: z.string().nonempty(),
  match: z.array(z.string()),
  components: z.array(
    z.object({
      enabled: z.boolean().default(true),
      name: z.string().nonempty(),
      type: z.string().default("Player"),
      code: z
        .string()
        .min(1, "Required")
        .superRefine(async (ts, ctx) => {
          try {
            console.log("validation");
            const component = await parsePluginComponent(ts);
            if (!component) throw new Error("");
            // component({});
          } catch (_) {
            return ctx.addIssue({
              code: "custom",
              message: "Invalid typescript",
            });
          }
        }),

      isEdit: z.boolean().optional().default(true),
      isDirty: z.boolean().optional().default(true),
    }),
  ),
});

export type PluginRawSchema = z.infer<typeof PluginRawSchema>;
