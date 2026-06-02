import { createContext, useContext, useState } from 'react'

const ReaderContext = createContext(null)

export function ReaderProvider({ children }) {
  const [readerMode, setReaderMode] = useState(false)
  return (
    <ReaderContext.Provider value={{ readerMode, setReaderMode }}>
      {children}
    </ReaderContext.Provider>
  )
}

export function useReader() {
  const ctx = useContext(ReaderContext)
  if (!ctx) throw new Error('useReader must be inside ReaderProvider')
  return ctx
}
