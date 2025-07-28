import { useState, useCallback, useRef, useEffect } from 'react'

import {
  searchRequest,
  structuredSearchRequest,
  fetchDocumentDetailsRequest,
} from './panFinderApi'

const usePanFinderApi = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingSteps, setStreamingSteps] = useState([])
  const [lastQuery, setLastQuery] = useState('')
  const controllerRef = useRef(null)
  const isMounted = useRef(true)

  useEffect(
    () => () => {
      isMounted.current = false
      controllerRef.current?.abort()
    },
    [],
  )

  const handleEvent = useCallback((event) => {
    setStreamingSteps((prev) => [...prev, event])
    switch (event.event) {
      case 'results':
        setData(event.data)
        break
      case 'error':
        setError(new Error(event.data.message))
        break
      default:
        // Handle other events if necessary
        break
    }
  }, [])

  const executeSearch = useCallback(
    async (searchFunction, ...args) => {
      setIsLoading(true)
      setError(null)
      setData(null)
      setStreamingSteps([])

      if (controllerRef.current) {
        controllerRef.current.abort()
      }
      const controller = new AbortController()
      controllerRef.current = controller

      try {
        await searchFunction(...args, handleEvent, controller.signal)
      } catch (error_) {
        if (error_.name !== 'AbortError' && isMounted.current) {
          setError(error_)
          setData(null)
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
        if (controllerRef.current === controller) {
          controllerRef.current = null
        }
      }
    },
    [handleEvent],
  )

  const search = useCallback(
    async (query) => {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        setError(new Error('Query is required and must be a non-empty string'))
        setIsLoading(false)
        return
      }

      setLastQuery(query.trim())
      await executeSearch(searchRequest, query)
    },
    [executeSearch],
  )

  const searchWithStructuredData = useCallback(
    async (structuredData, originalQuery) => {
      if (!structuredData || typeof structuredData !== 'object') {
        setError(new Error('Structured data is required and must be an object'))
        setIsLoading(false)
        return
      }

      const queryToUse = originalQuery || lastQuery || ''
      await executeSearch(structuredSearchRequest, structuredData, queryToUse)
    },
    [executeSearch, lastQuery],
  )

  const fetchDocumentDetails = useCallback(async (doi) => {
    try {
      return await fetchDocumentDetailsRequest(doi)
    } catch (error_) {
      throw new Error(`Failed to fetch document details: ${error_.message}`)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
    setStreamingSteps([])
  }, [])

  return {
    data,
    error,
    isLoading,
    streamingSteps,
    search,
    searchWithStructuredData,
    reset,
    fetchDocumentDetails,
  }
}

export { usePanFinderApi }
