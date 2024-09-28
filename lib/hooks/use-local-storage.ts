import { useState } from 'react'

/**
 * A custom hook that synchronizes a state variable with localStorage. Prioritizes initialValue.
 * @param initialKey The initial key under which the value is stored in localStorage.
 * @param initialValue Initial value for the state, uses existing (if any) localStorage value if undefined
 * @returns The current stateful value and a function to set the value.
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue?: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(
    initialValue
      ? initialValue
      : JSON.parse(window.localStorage.getItem(key) || 'null')
  )

  const setValue = (value: T) => {
    setStoredValue(value)
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  return [storedValue, setValue]
}
