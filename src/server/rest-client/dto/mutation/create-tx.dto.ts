import { z } from "zod";

export const CreateTxDto = z.object({
  sender: z.string(),
  to: z.string(),
  amount: z.number(),
  signature: z.string(),
  fee: z.number().optional(),
});

export type ICreateTxDto = z.infer<typeof CreateTxDto>;
