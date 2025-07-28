import { useState, useCallback, useRef, useEffect } from 'react'

const PAN_FINDER_API_BASE =
  process.env.REACT_APP_PAN_FINDER_API || 'http://127.0.0.1:8080'

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

  /* eslint-disable sonarjs/cognitive-complexity */
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

    // Cancel any in-flight request
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      const searchData = { query: query.trim() }
      const response = await fetch(`${PAN_FINDER_API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEvent = null
      let currentData = null

      const processStream = async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          // eslint-disable-next-line no-await-in-loop
          const { done, value } = await reader.read()
          if (done) {
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()

            if (trimmedLine.startsWith('event: ')) {
              currentEvent = trimmedLine.slice(7).trim()
            } else if (trimmedLine.startsWith('data: ')) {
              currentData = trimmedLine.slice(6).trim()
            } else if (trimmedLine === '' && currentEvent && currentData) {
              // Empty line indicates end of event, process the event-data pair
              const eventType = currentEvent
              const eventData = currentData
              try {
                const parsed = JSON.parse(eventData)
                setStreamingSteps((prev) => [
                  ...prev,
                  { event: eventType, data: parsed, timestamp: Date.now() },
                ])
                if (eventType === 'results') {
                  setData(parsed)
                }
                if (eventType === 'error') {
                  throw new Error(parsed.message)
                }
              } catch {
                // Skip malformed data
              }
              // Reset for next event
              currentEvent = null
              currentData = null
            } else {
              // Ignore other lines (comments, unknown fields, etc.)
            }
          }
        }
      }

      await processStream()
    } catch (error_) {
      if (error_.name === 'AbortError') {
        if (isMounted.current) {
          setIsLoading(false)
        }
        return
      }
      if (isMounted.current) {
        setError(error_)
        setData(null)
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
      // Clear the controller reference
      if (controllerRef.current === controller) {
        controllerRef.current = null
      }
    }
  }, [])

  const fetchDocumentDetails = useCallback(async (doi) => {
    if (!doi || typeof doi !== 'string' || doi.trim() === '') {
      throw new Error('DOI is required and must be a non-empty string')
    }

    try {
      const response = await fetch(
        `${PAN_FINDER_API_BASE}/search/document/${encodeURIComponent(doi)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
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
