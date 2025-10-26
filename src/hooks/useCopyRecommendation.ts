import { useState, useRef } from 'react'
import type { editor } from 'monaco-editor'

export function useCopyRecommendation() {
  const [copyRecommendation, setCopyRecommendation] = useState<string>('')
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const setEditorReference = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const setCopyRangeFromSelection = () => {
    const editor = editorRef.current
    if (!editor) return false

    const selection = editor.getSelection()
    if (!selection || selection.isEmpty()) {
      return false
    }

    const rangeString = `${selection.startLineNumber}:${selection.startColumn}-${selection.endLineNumber}:${selection.endColumn}`
    setCopyRecommendation(rangeString)
    return true
  }

  const clearCopyRecommendation = () => {
    setCopyRecommendation('')
  }

  return {
    copyRecommendation,
    setCopyRecommendation,
    setCopyRangeFromSelection,
    clearCopyRecommendation,
    setEditorReference,
    editorRef,
  }
}
