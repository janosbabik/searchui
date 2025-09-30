const PAN_FINDER_API_BASE =
  process.env.REACT_APP_PAN_FINDER_API || 'http://127.0.0.1:8080'

const JSON_CONTENT_TYPE = 'application/json'

const apiRequest = async (url, options) => {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response
}

// Helper function to validate DOI parameter
const validateDoi = (doi) => {
  if (!doi || typeof doi !== 'string' || doi.trim() === '') {
    throw new Error('DOI is required and must be a non-empty string')
  }
}

// Helper function to create standard headers with session
const createHeaders = (sessionId, additionalHeaders = {}) => ({
  'Content-Type': JSON_CONTENT_TYPE,
  'X-Session-ID': sessionId,
  ...additionalHeaders,
})

// Helper function for GET requests that return JSON
const makeGetRequest = async (url, sessionId) => {
  const response = await apiRequest(url, {
    method: 'GET',
    headers: createHeaders(sessionId),
  })
  return response.json()
}

const processStream = async (reader, onEvent) => {
  const decoder = new TextDecoder()
  let buffer = ''
  let currentEvent = null
  let currentData = null

  const processLine = (line) => {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('event: ')) {
      currentEvent = trimmedLine.slice(7).trim()
    } else if (trimmedLine.startsWith('data: ')) {
      currentData = trimmedLine.slice(6).trim()
    } else if (trimmedLine === '' && currentEvent && currentData) {
      try {
        const parsed = JSON.parse(currentData)
        onEvent({ event: currentEvent, data: parsed, timestamp: Date.now() })
      } catch {
        // Skip malformed data
      }
      currentEvent = null
      currentData = null
    } else {
      // Ignore other lines (comments, unknown fields, etc.)
    }
  }

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
    lines.forEach(processLine)
  }
}

export const createSessionRequest = async (turnstileToken) => {
  if (!turnstileToken || typeof turnstileToken !== 'string') {
    throw new Error('Turnstile token is required')
  }

  const response = await apiRequest(`${PAN_FINDER_API_BASE}/session/create`, {
    method: 'POST',
    headers: { 'Content-Type': JSON_CONTENT_TYPE },
    body: JSON.stringify({ turnstile_token: turnstileToken }),
  })
  return response.json()
}

// Factory function that creates session-bound API methods
export const createPanFinderApi = (sessionId) => {
  if (!sessionId) {
    throw new Error('Session ID is required to create API instance')
  }

  return {
    search: async (query, onEvent, signal) => {
      const searchData = { query }
      const response = await apiRequest(`${PAN_FINDER_API_BASE}/search`, {
        method: 'POST',
        headers: createHeaders(sessionId),
        body: JSON.stringify(searchData),
        signal,
      })
      const reader = response.body.getReader()
      await processStream(reader, onEvent)
    },

    searchWithStructuredData: async (id, structuredData, onEvent, signal) => {
      const searchData = {
        modified_query_id: id,
        structured_data: structuredData,
      }
      const response = await apiRequest(
        `${PAN_FINDER_API_BASE}/search/structured`,
        {
          method: 'POST',
          headers: createHeaders(sessionId),
          body: JSON.stringify(searchData),
          signal,
        },
      )
      const reader = response.body.getReader()
      await processStream(reader, onEvent)
    },

    fetchDocumentDetails: async (doi) => {
      validateDoi(doi)
      return makeGetRequest(
        `${PAN_FINDER_API_BASE}/document/${encodeURIComponent(doi)}`,
        sessionId,
      )
    },

    fetchRawDocument: async (doi) => {
      validateDoi(doi)
      return makeGetRequest(
        `${PAN_FINDER_API_BASE}/document/raw/${encodeURIComponent(doi)}`,
        sessionId,
      )
    },

    submitFeedback: async ({ statistic_id, feedback_type, doi }) => {
      if (!statistic_id || !feedback_type || !doi) {
        throw new Error('statistic_id, feedback_type, and doi are required')
      }
      const response = await apiRequest(
        `${PAN_FINDER_API_BASE}/feedback/submit`,
        {
          method: 'POST',
          headers: createHeaders(sessionId),
          body: JSON.stringify({
            statistic_id,
            feedback_type,
            doi,
          }),
        },
      )
      return response.json()
    },
  }
}
