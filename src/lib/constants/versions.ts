export const AVAILABLE_TYPST_VERSIONS = [
  '0.14.1',
  '0.14.0',
  '0.13.1',
  '0.13.0',
  '0.12.0',
] as const

export type TypstVersion = (typeof AVAILABLE_TYPST_VERSIONS)[number]
