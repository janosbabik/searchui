import { useState, useCallback, useRef, useEffect } from 'react'

import { useFeedback } from '../contexts/FeedbackContext'
import {
  searchRequest,
  structuredSearchRequest,
  fetchDocumentDetailsRequest,
  submitFeedbackRequest,
  createSessionRequest,
} from './panFinderApi'

const usePanFinderApi = (onSessionInvalid) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingSteps, setStreamingSteps] = useState([])
  const { setCurrentQueryId } = useFeedback()
  const controllerRef = useRef(null)
  const isMounted = useRef(true)

  useEffect(
    () => () => {
      isMounted.current = false
      controllerRef.current?.abort()
    },
    [],
  )

  const handleEvent = useCallback(
    (event) => {
      setStreamingSteps((prev) => [...prev, event])
      switch (event.event) {
        case 'results':
          setData(event.data)
          // if there is id in the event.data set it as queryId and context
          if (event.data.id) {
            setCurrentQueryId(event.data.id)
          }
          break
        case 'error':
          setError(new Error(event.data.message))
          break
        default:
          // Handle other events if necessary
          break
      }
    },
    [setCurrentQueryId],
  )

  const executeSearch = useCallback(
    async (searchFunction, ...args) => {
      const isUnauthorizedError = (error) =>
        error.message.includes('HTTP 401') ||
        error.message.includes('Unauthorized')

      setIsLoading(true)
      setError(null)
      setData(null)
      setCurrentQueryId(null)
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
          if (isUnauthorizedError(error_)) {
            onSessionInvalid && onSessionInvalid()
          } else {
            setError(error_)
          }
          setData(null)
        }
      } finally {
        if (isMounted.current) {
          setStreamingSteps([])
          setIsLoading(false)
        }
        if (controllerRef.current === controller) {
          controllerRef.current = null
        }
      }
    },
    [handleEvent, setCurrentQueryId, onSessionInvalid],
  )

  const search = useCallback(
    async (query, sessionId) => {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        setError(new Error('Query is required and must be a non-empty string'))
        setIsLoading(false)
        return
      }

      if (!sessionId || typeof sessionId !== 'string') {
        setError(new Error('Session ID is required'))
        setIsLoading(false)
        return
      }

      await executeSearch(searchRequest, query, sessionId)
    },
    [executeSearch],
  )

  const createSession = useCallback(async (turnstileToken) => {
    try {
      return await createSessionRequest(turnstileToken)
    } catch (error_) {
      throw new Error(`Failed to create session: ${error_.message}`)
    }
  }, [])

  const searchWithStructuredData = useCallback(
    async (id, structuredData, sessionId) => {
      if (!structuredData || typeof structuredData !== 'object') {
        setError(new Error('Structured data is required and must be an object'))
        setIsLoading(false)
        return
      }

      if (!sessionId || typeof sessionId !== 'string') {
        setError(new Error('Session ID is required'))
        setIsLoading(false)
        return
      }

      await executeSearch(
        structuredSearchRequest,
        id,
        structuredData,
        sessionId,
      )
    },
    [executeSearch],
  )

  const fetchDocumentDetails = useCallback(async (doi) => {
    try {
      return await fetchDocumentDetailsRequest(doi)
    } catch (error_) {
      throw new Error(`Failed to fetch document details: ${error_.message}`)
    }
  }, [])

  const submitFeedback = useCallback(
    async ({ statistic_id, feedback_type, doi }) => {
      try {
        return await submitFeedbackRequest({ statistic_id, feedback_type, doi })
      } catch (error_) {
        throw new Error(`Failed to submit feedback: ${error_.message}`)
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
    setStreamingSteps([])
    setCurrentQueryId(null)
  }, [setCurrentQueryId])

  return {
    data,
    error,
    isLoading,
    streamingSteps,
    search,
    searchWithStructuredData,
    reset,
    fetchDocumentDetails,
    submitFeedback,
    createSession,
  }
}

export { usePanFinderApi }
