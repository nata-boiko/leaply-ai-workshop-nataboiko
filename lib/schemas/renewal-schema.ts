import { z } from "zod"

export const RenewalSchema = z.object({
  subscription_id: z.string().uuid(),
  renewed_at: z.string().min(1, "Оберіть дату"),
  plan_name: z.string().optional().nullable(),
  status: z.enum(["active", "new", "canceled"]).default("active"),
  cost_per_cycle: z.coerce.number().min(0).default(0),
  billing_cycle: z.enum(["monthly", "annual"]).default("monthly"),
  currency: z.string().default("USD"),
  credits_included: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type RenewalInput = z.infer<typeof RenewalSchema>
