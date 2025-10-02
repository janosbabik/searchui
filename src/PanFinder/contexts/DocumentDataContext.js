import React, { createContext, useContext, useState, useCallback } from 'react'

const DocumentDataContext = createContext({
  explanations: {},
  explanationErrors: {},
  rawDataCache: {},
  rawDataErrors: {},
  setExplanation: () => {
    /* default no-op */
  },
  setExplanationError: () => {
    /* default no-op */
  },
  setRawData: () => {
    /* default no-op */
  },
  setRawDataError: () => {
    /* default no-op */
  },
  clearAll: () => {
    /* default no-op */
  },
})

export function DocumentDataProvider({ children }) {
  const [explanations, setExplanations] = useState({})
  const [explanationErrors, setExplanationErrors] = useState({})
  const [rawDataCache, setRawDataCache] = useState({})
  const [rawDataErrors, setRawDataErrors] = useState({})

  const setExplanation = useCallback((key, content) => {
    setExplanations((prev) => {
      // If content is a function, call it with current value
      if (typeof content === 'function') {
        return {
          ...prev,
          [key]: content(prev[key] || ''),
        }
      }
      return {
        ...prev,
        [key]: content,
      }
    })
  }, [])

  const setExplanationError = useCallback((key, error) => {
    setExplanationErrors((prev) => ({
      ...prev,
      [key]: error,
    }))
  }, [])

  const setRawData = useCallback((doi, data) => {
    setRawDataCache((prev) => ({
      ...prev,
      [doi]: data,
    }))
  }, [])

  const setRawDataError = useCallback((doi, error) => {
    setRawDataErrors((prev) => ({
      ...prev,
      [doi]: error,
    }))
  }, [])

  const clearAll = useCallback(() => {
    setExplanations({})
    setExplanationErrors({})
    setRawDataCache({})
    setRawDataErrors({})
  }, [])

  return React.createElement(
    DocumentDataContext.Provider,
    {
      value: {
        explanations,
        explanationErrors,
        rawDataCache,
        rawDataErrors,
        setExplanation,
        setExplanationError,
        setRawData,
        setRawDataError,
        clearAll,
      },
    },
    children,
  )
}

export const useDocumentData = () => {
  const context = useContext(DocumentDataContext)
  if (!context) {
    throw new Error(
      'useDocumentData must be used within a DocumentDataProvider',
    )
  }
  return context
}
