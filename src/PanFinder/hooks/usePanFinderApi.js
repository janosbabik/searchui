import { useState, useCallback, useRef, useEffect } from 'react'

import { useFeedback } from '../contexts/FeedbackContext'
import { useSession } from '../contexts/SessionContext'
import {
  searchRequest,
  structuredSearchRequest,
  fetchDocumentDetailsRequest,
  submitFeedbackRequest,
  createSessionRequest,
} from './panFinderApi'

const SESSION_ID_REQUIRED_MSG = 'Session ID is required'

const isUnauthorizedError = (error) =>
  error.message.includes('HTTP 401') || error.message.includes('Unauthorized')

const usePanFinderApi = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingSteps, setStreamingSteps] = useState([])
  const [explanation, setExplanation] = useState('')
  const [isExplanationComplete, setIsExplanationComplete] = useState(false)
  const [explanationError, setExplanationError] = useState(null)
  const { setCurrentQueryId } = useFeedback()
  const {
    getSessionId,
    invalidateSession,
    createSession: createSessionFromContext,
  } = useSession()
  const controllerRef = useRef(null)

  useEffect(
    () => () => {
      controllerRef.current?.abort()
    },
    [],
  )

  const getValidSessionId = useCallback(() => {
    const sessionId = getSessionId()
    if (!sessionId) {
      setError(new Error(SESSION_ID_REQUIRED_MSG))
      return null
    }
    return sessionId
  }, [getSessionId])

  const handleEvent = useCallback(
    (event) => {
      if (!['results', 'explanation_chunk'].includes(event.event)) {
        setStreamingSteps((prev) => [...prev, event])
      }
      switch (event.event) {
        case 'results':
          setData(event.data)
          // if there is id in the event.data set it as queryId and context
          if (event.data.id) {
            setCurrentQueryId(event.data.id)
          }
          break
        case 'generating_explanation':
          // Reset explanation state when starting
          setExplanation('')
          setIsExplanationComplete(false)
          setExplanationError(null)
          break
        case 'explanation_chunk':
          setStreamingSteps([])
          // Append new content to explanation
          if (event.data?.content) {
            setExplanation((prev) => prev + event.data.content)
          }
          break
        case 'explanation_complete':
          setIsExplanationComplete(true)
          break
        case 'explanation_error':
          setExplanationError(
            event.data?.message || 'Failed to generate explanation',
          )
          setIsExplanationComplete(true)
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
      setIsLoading(true)
      setError(null)
      setData(null)
      setCurrentQueryId(null)
      setStreamingSteps([])
      setExplanation('')
      setIsExplanationComplete(false)
      setExplanationError(null)

      if (controllerRef.current) {
        controllerRef.current.abort()
      }
      const controller = new AbortController()
      controllerRef.current = controller

      try {
        const sessionId = getValidSessionId()
        if (!sessionId) {
          setIsLoading(false)
          setError(new Error(SESSION_ID_REQUIRED_MSG))
          return
        }

        await searchFunction(...args, sessionId, handleEvent, controller.signal)
      } catch (error_) {
        if (error_.name !== 'AbortError') {
          if (isUnauthorizedError(error_)) {
            invalidateSession()
          } else {
            setError(error_)
          }
          setData(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setStreamingSteps([]) // Clear streaming steps after processing
          setIsLoading(false)
        }
        if (controllerRef.current === controller) {
          controllerRef.current = null
        }
      }
    },
    [handleEvent, setCurrentQueryId, invalidateSession, getValidSessionId],
  )

  const search = useCallback(
    async (query) => {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        setError(new Error('Query is required and must be a non-empty string'))
        setIsLoading(false)
        return
      }

      await executeSearch(searchRequest, query)
    },
    [executeSearch],
  )

  const createSession = useCallback(
    async (turnstileToken) => {
      if (!turnstileToken || typeof turnstileToken !== 'string') {
        const error = new Error('Valid Turnstile token is required')
        setError(error)
        throw error
      }

      setIsLoading(true)
      setError(null)

      try {
        return await createSessionFromContext(
          createSessionRequest,
          turnstileToken,
        )
      } catch (error_) {
        const sessionError = new Error(
          `Failed to create session: ${error_.message}`,
        )
        setError(sessionError)
        throw sessionError
      } finally {
        setIsLoading(false)
      }
    },
    [createSessionFromContext],
  )

  const searchWithStructuredData = useCallback(
    async (id, structuredData) => {
      await executeSearch(structuredSearchRequest, id, structuredData)
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
        const sessionId = getValidSessionId()
        if (!sessionId) {
          return
        }

        return await submitFeedbackRequest({
          statistic_id,
          feedback_type,
          doi,
          sessionId,
        })
      } catch (error_) {
        if (isUnauthorizedError(error_)) {
          invalidateSession()
        } else {
          setError(error_)
        }
        throw new Error(`Failed to submit feedback: ${error_.message}`)
      }
    },
    [invalidateSession, getValidSessionId],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
    setStreamingSteps([])
    setCurrentQueryId(null)
    setExplanation('')
    setIsExplanationComplete(false)
    setExplanationError(null)
  }, [setCurrentQueryId])

  return {
    data,
    error,
    isLoading,
    streamingSteps,
    explanation,
    isExplanationComplete,
    explanationError,
    search,
    searchWithStructuredData,
    reset,
    fetchDocumentDetails,
    submitFeedback,
    createSession,
  }
}

export { usePanFinderApi }
