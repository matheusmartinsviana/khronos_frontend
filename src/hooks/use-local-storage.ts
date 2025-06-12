import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      // Obter do localStorage
      const item = window.localStorage.getItem(key)
      // Parse do JSON armazenado ou retorna o valor inicial
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // Se erro, retorna o valor inicial
      console.log(error)
      return initialValue
    }
  })

  // Função para definir o valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite que o valor seja uma função para que tenhamos a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Salva no estado
      setStoredValue(valueToStore)
      // Salva no localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // Um erro mais avançado de tratamento seria implementar aqui
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}
