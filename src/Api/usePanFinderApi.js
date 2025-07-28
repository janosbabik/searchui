import { useState, useCallback, useRef, useEffect } from 'react'

import { searchRequest, fetchDocumentDetailsRequest } from './panFinderApi'

const usePanFinderApi = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingSteps, setStreamingSteps] = useState([])
  const controllerRef = useRef(null)
  const isMounted = useRef(true)

  useEffect(
    () => () => {
      isMounted.current = false
      controllerRef.current?.abort()
    },
    [],
  )

  const search = useCallback(async (query) => {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      setError(new Error('Query is required and must be a non-empty string'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setData(null)
    setStreamingSteps([])

    if (controllerRef.current) {
      controllerRef.current.abort()
    }
    const controller = new AbortController()
    controllerRef.current = controller

    const handleEvent = (event) => {
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
    }

    try {
      await searchRequest(query, handleEvent, controller.signal)
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
  }, [])

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
    reset,
    fetchDocumentDetails,
  }
}

export { usePanFinderApi }
