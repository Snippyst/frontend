import { z } from 'zod'

export const snippetFormSchema = z.object({
  title: z
    .string()
    .min(3, 'The title is too short')
    .max(60, 'The title is too long'),
  description: z.string().max(16000, 'The description is too long'),
  code: z
    .string()
    .min(10, 'The snippet is too short to be added')
    .max(32000, 'The snippet is too long'),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .max(10, 'You can select up to 10 tags'),
  alternateAuthor: z
    .string()
    .max(200, 'The alternate author name(s) is too long'),
  packages: z.array(
    z.object({
      namespace: z.string(),
      name: z.string(),
      version: z.string(),
    }),
  ),
  copyRecommendation: z.string(),
  versions: z
    .array(z.string())
    .min(1, 'At least one version must be selected'),
})

export type SnippetFormValues = z.infer<typeof snippetFormSchema>
