import { z } from "zod"

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  ANTHROPIC_API_KEY: z.string().default(""),
  SUPABASE_URL: z.string().default(""),
  SUPABASE_ANON_KEY: z.string().default(""),
  FIRECRAWL_API_KEY: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().optional(),
})

export const env = EnvSchema.parse(process.env)
export type Env = z.infer<typeof EnvSchema>
