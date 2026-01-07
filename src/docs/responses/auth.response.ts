import { z } from "zod";

export const GoogleAuthResponse = {
  description:
    "Redirects to frontend with a one-time `session_code` in query parameters.",
};

export const InvalidGoogleAuthResponse = {
  description: "Missing or invalid parameters or domain.",
  content: {
    "application/json": {
      schema: z.object({ error: z.string() }),
    },
  },
};