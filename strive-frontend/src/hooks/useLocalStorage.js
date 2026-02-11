// Imports
import { useState, useEffect } from 'react'

// Local Storage helper
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const jsonValue = localStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
        console.error(`Failed to read/write localStorage key "${key}"`, err)
    }
  }, [key, value])

  return [value, setValue]
}