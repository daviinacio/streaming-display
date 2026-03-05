import { JavascriptSchema } from "@/lib/schema";
import { z } from "zod/v3";

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
      code: z.string().nonempty(),
      // code: JavascriptSchema({}),

      isEdit: z.boolean().optional().default(true),
      isDirty: z.boolean().optional().default(true),
    }),
  ),
});

export type PluginRawSchema = z.infer<typeof PluginRawSchema>;
