import { useState, useCallback } from 'react'

export interface FormState {
  currentStep: number
  answers: Record<string, string>
  isSubmitting: boolean
  isSuccess: boolean
  error: string | null
}

export function useMultiStepForm(totalSteps: number) {
  const [state, setState] = useState<FormState>({
    currentStep: 0,
    answers: {},
    isSubmitting: false,
    isSuccess: false,
    error: null,
  })

  const nextStep = useCallback(() => {
    setState((s) => ({
      ...s,
      currentStep: Math.min(s.currentStep + 1, totalSteps),
      error: null,
    }))
  }, [totalSteps])

  const prevStep = useCallback(() => {
    setState((s) => ({
      ...s,
      currentStep: Math.max(s.currentStep - 1, 0),
      error: null,
    }))
  }, [])

  const setAnswer = useCallback((key: string, value: string) => {
    setState((s) => ({
      ...s,
      answers: { ...s.answers, [key]: value },
    }))
  }, [])

  const setSubmitting = useCallback((v: boolean) => {
    setState((s) => ({ ...s, isSubmitting: v }))
  }, [])

  const setSuccess = useCallback(() => {
    setState((s) => ({ ...s, isSuccess: true, isSubmitting: false }))
  }, [])

  const setError = useCallback((msg: string) => {
    setState((s) => ({ ...s, error: msg, isSubmitting: false }))
  }, [])

  return {
    ...state,
    nextStep,
    prevStep,
    setAnswer,
    setSubmitting,
    setSuccess,
    setError,
  }
}
