import type { Monaco } from '@monaco-editor/react'
import { createHighlighter } from 'shiki'
import { shikiToMonaco } from '@shikijs/monaco'

let isTypstRegistered = false
let highlighterPromise: Promise<void> | null = null

export async function registerTypstLanguage(monaco: Monaco): Promise<void> {
  if (isTypstRegistered) {
    return highlighterPromise || Promise.resolve()
  }

  isTypstRegistered = true

  monaco.languages.register({
    id: 'typst',
    extensions: ['.typ'],
    aliases: ['Typst', 'typst'],
    mimetypes: ['text/x-typst'],
  })

  const { default: typstGrammar } = await import(
    './grammars/typst.tmLanguage.json'
  )
  const { default: languageConfiguration } = await import(
    './grammars/language-configuration.json'
  )

  monaco.languages.setLanguageConfiguration('typst', {
    ...(languageConfiguration as any),
    folding: {
      markers: {
        start: /^\s*\/\/\s*#?region\b/,
        end: /^\s*\/\/\s*#?endregion\b/,
      },
    },
  })

  highlighterPromise = (async () => {
    try {
      const highlighter = await createHighlighter({
        themes: ['dark-plus', 'light-plus'],
        langs: [typstGrammar as any],
      })

      shikiToMonaco(highlighter, monaco)
    } catch (error) {
      console.error('Failed to initialize Typst syntax highlighting:', error)
    }
  })()

  return highlighterPromise
}

export function setTypstTheme(monaco: Monaco, theme: 'light' | 'dark'): void {
  const monacoTheme = theme === 'dark' ? 'dark-plus' : 'light-plus'
  monaco.editor.setTheme(monacoTheme)
}
