import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { createSnippet } from '../lib/api/snippets'

interface FormValues {
  title: string
  description: string
  tags: Array<{ id: string; name: string }>
  alternateAuthor: string
  code: string
  packages: Array<{
    namespace: string
    name: string
    version: string
  }>
  copyRecommendation: string
}

const defaultValues: FormValues = {
  title: '',
  description: '',
  tags: [],
  alternateAuthor: '',
  code: '',
  packages: [],
  copyRecommendation: '',
}

export function useSnippetForm() {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<FormValues>(defaultValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    if (!formValues.title || formValues.title.trim().length === 0) {
      setSubmitError('Title is required')
      setIsSubmitting(false)
      return
    }

    if (!formValues.code || formValues.code.trim().length === 0) {
      setSubmitError('Code is required')
      setIsSubmitting(false)
      return
    }

    try {
      const createdSnippet = await createSnippet({
        title: formValues.title,
        description: formValues.description,
        content: formValues.code,
        tags: formValues.tags.map((tag) => tag.id),
        packages: formValues.packages,
        copyRecommendation: formValues.copyRecommendation,
        author: formValues.alternateAuthor || undefined,
      })

      navigate({ to: `/snippets/${createdSnippet.id}` })
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create snippet. Please try again.'
      setSubmitError(errorMessage)
      setIsSubmitting(false)
    }
  }

  return {
    formValues,
    updateField,
    handleSubmit,
    isSubmitting,
    submitError,
  }
}
