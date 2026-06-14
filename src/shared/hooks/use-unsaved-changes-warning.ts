import { useEffect } from 'react'

/**
 * Warn before leaving the page (refresh / tab close) while a form has unsaved
 * changes. This is the browser-level foundation — wire `when` to React Hook
 * Form's `formState.isDirty`. In-app navigation blocking can be layered on top
 * later (e.g. a React Router blocker) once flows exist that need it.
 *
 * @example
 *   const { formState } = useForm(...)
 *   useUnsavedChangesWarning(formState.isDirty && !formState.isSubmitting)
 */
export function useUnsavedChangesWarning(when: boolean): void {
  useEffect(() => {
    if (!when) return

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Required for some browsers to show the native prompt.
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [when])
}
