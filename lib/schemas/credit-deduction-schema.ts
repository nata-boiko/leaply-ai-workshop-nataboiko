import { z } from "zod"

export const CreditDeductionSchema = z.object({
  subscription_id: z.string().uuid(),
  charged_at: z.string().min(1, "Оберіть дату"),
  credits_amount: z.coerce.number().min(0),
  notes: z.string().optional().nullable(),
  source: z.enum(["manual", "checkup"]).default("manual"),
  usage_log_id: z.string().uuid().optional().nullable(),
})

export type CreditDeductionInput = z.infer<typeof CreditDeductionSchema>
