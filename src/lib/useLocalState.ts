'use client'

import { useEffect, useRef, useState } from 'react'
import { loadJSON, saveJSON } from './storage'

// Generic localStorage-backed state. Renders with `initial` during SSR/first
// paint, then hydrates from localStorage on mount — avoids server/client
// markup mismatches for a client-only personal tool.
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)
  const skipNextSave = useRef(true)

  useEffect(() => {
    // Intentional one-time hydration from localStorage after mount — the lazy
    // useState initializer alternative would read `window` during SSR and
    // cause a hydration mismatch instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(loadJSON(key, initial))
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    if (hydrated) saveJSON(key, value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, hydrated])

  return [value, setValue, hydrated] as const
}
