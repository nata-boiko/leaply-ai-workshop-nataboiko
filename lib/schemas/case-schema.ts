import { z } from "zod"

export const CaseSchema = z.object({
  tool_id: z.string().uuid(),
  task_name: z.string().min(1, "Назва задачі обов'язкова"),
  task_details: z.string().optional(),
  approach: z.string().optional(),
  iterations: z.coerce.number().int().min(1).optional(),
  outcome: z.string().optional(),
  success: z.boolean().default(true),
  time_spent_min: z.coerce.number().int().min(0).optional(),
  time_without_ai_min: z.coerce.number().int().min(0).optional(),
  source: z.enum(["web", "extension"]).default("web"),
})

export type CaseInput = z.infer<typeof CaseSchema>
