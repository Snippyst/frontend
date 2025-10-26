import { z } from 'zod'

export const tagFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Tag name must be at least 3 characters')
    .max(30, 'Tag name must be at most 30 characters')
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      'Tag name can only contain letters, numbers, spaces, and hyphens',
    ),
  description: z
    .string()
    .max(1000, 'Description too long')
    .optional()
    .or(z.literal('')),
})

export type TagFormValues = z.infer<typeof tagFormSchema>
