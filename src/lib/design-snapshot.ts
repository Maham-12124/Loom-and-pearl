import { z } from "zod";

const beadSlotSchema = z.object({
  beadId: z.string().nullable(),
  hexCode: z.string(),
  finish: z.string().min(1),
});

export const designSnapshotSchema = z.object({
  wristSize: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  beads: z.array(beadSlotSchema),
  charmId: z.string().nullable(),
  symmetryEnabled: z.boolean(),
  packaging: z.object({ packagingId: z.string().nullable(), note: z.string() }),
});

export type DesignSnapshot = z.infer<typeof designSnapshotSchema>;

/** OrderItem.designSnapshot is stored as Json — parse it back into the design
 * shape used by the customizer/showcase components. */
export function parseDesignSnapshot(json: unknown): DesignSnapshot {
  return designSnapshotSchema.parse(json);
}
