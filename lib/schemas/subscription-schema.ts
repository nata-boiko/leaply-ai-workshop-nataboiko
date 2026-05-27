import { z } from "zod"

export const SubscriptionSchema = z.object({
  tool_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Назва обов'язкова"),
  plan_name: z.string().optional().nullable(),
  status: z.enum(["active", "canceled"]).default("active"),
  currency: z.string().min(1).default("USD"),
  cost_per_cycle: z.coerce.number().min(0).default(0),
  billing_cycle: z.enum(["monthly", "annual"]).default("monthly"),
  renewal_date: z.string().optional().nullable(),
  credits_included: z.coerce.number().min(0).optional().nullable(),
  credits_unit: z.string().optional().nullable(),
  url: z
    .string()
    .url("Некоректне посилання")
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z.string().optional().nullable(),
})

export type SubscriptionInput = z.infer<typeof SubscriptionSchema>
