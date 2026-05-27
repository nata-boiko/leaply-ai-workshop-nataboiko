import { z } from "zod"

export const UsageSchema = z.object({
  subscription_id: z.string().uuid(),
  period_month: z.string().min(1, "Оберіть місяць"),
  credits_used: z.coerce.number().min(0).default(0),
  credits_remaining: z.coerce.number().min(0).optional().nullable(),
  creo_count: z.coerce.number().int().min(0).default(0),
  extra_credits_cost: z.coerce.number().min(0).default(0),
  extra_credits_source: z.string().optional().nullable(),
})

export type UsageInput = z.infer<typeof UsageSchema>
