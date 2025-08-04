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

export const createSessionRequest = async (turnstile_token) => {
  if (!turnstile_token || typeof turnstile_token !== 'string') {
    throw new Error('Turnstile token is required')
  }

  const response = await apiRequest(`${PAN_FINDER_API_BASE}/session/create`, {
    method: 'POST',
    headers: { 'Content-Type': JSON_CONTENT_TYPE },
    body: JSON.stringify({ turnstile_token }),
  })
  return response.json()
}

export const searchRequest = async (query, session_id, onEvent, signal) => {
  const searchData = { query, session_id }
  const response = await apiRequest(`${PAN_FINDER_API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': JSON_CONTENT_TYPE },
    body: JSON.stringify(searchData),
    signal,
  })
  const reader = response.body.getReader()
  await processStream(reader, onEvent)
}

export const structuredSearchRequest = async (
  id,
  structuredData,
  sessionId,
  onEvent,
  signal,
) => {
  const searchData = {
    modified_query_id: id,
    structured_data: structuredData,
    session_id: sessionId,
  }
  const response = await apiRequest(
    `${PAN_FINDER_API_BASE}/search/structured`,
    {
      method: 'POST',
      headers: { 'Content-Type': JSON_CONTENT_TYPE },
      body: JSON.stringify(searchData),
      signal,
    },
  )
  const reader = response.body.getReader()
  await processStream(reader, onEvent)
}

export const fetchDocumentDetailsRequest = async (doi) => {
  if (!doi || typeof doi !== 'string' || doi.trim() === '') {
    throw new Error('DOI is required and must be a non-empty string')
  }
  const response = await apiRequest(
    `${PAN_FINDER_API_BASE}/document/${encodeURIComponent(doi)}`,
    {
      method: 'GET',
      headers: { 'Content-Type': JSON_CONTENT_TYPE },
    },
  )
  return response.json()
}

export const submitFeedbackRequest = async ({
  statistic_id,
  feedback_type,
  doi,
  sessionId,
}) => {
  if (!statistic_id || !feedback_type || !doi) {
    throw new Error('statistic_id, feedback_type, and doi are required')
  }
  const response = await apiRequest(`${PAN_FINDER_API_BASE}/feedback/submit`, {
    method: 'POST',
    headers: { 'Content-Type': JSON_CONTENT_TYPE },
    body: JSON.stringify({
      statistic_id,
      feedback_type,
      doi,
      session_id: sessionId,
    }),
  })
  return response.json()
}
