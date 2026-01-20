import { z } from "zod";

export const UidSchema = z.object({
  uid: z.string(),
});
