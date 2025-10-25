import { useState } from 'react'

interface UseCopyToClipboardReturn {
  copyStatus: string | null
  copyToClipboard: (text: string, label: string) => Promise<void>
}

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus(label)
      setTimeout(() => setCopyStatus(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return {
    copyStatus,
    copyToClipboard,
  }
}
