import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

const Input = z.object({
  imageDataUrl: z
    .string()
    .min(40)
    .max(12_000_000)
    .regex(/^data:image\/(png|jpe?g|webp);base64,/i, "Must be a base64 image data URL"),
});

export const whiteboardConvert = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => Input.parse(input))
  .handler(async () => {
    // Handwriting-to-LaTeX recognition is not implemented.
    // This endpoint exists to keep the whiteboard UI functional without AI entitlement.
    // A real handwriting-to-LaTeX implementation would go here.
    throw new Error(
      "Handwriting-to-LaTeX recognition is not available. " +
        "This feature requires a dedicated handwriting-math recognition implementation " +
        "that does not depend on the platform AI Gateway.",
    );
  });
