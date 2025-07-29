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

export const searchRequest = async (query, onEvent, signal) => {
  const searchData = { query: query.trim() }
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
  structuredData,
  originalQuery,
  onEvent,
  signal,
) => {
  const searchData = {
    structured_data: structuredData,
    original_query: originalQuery || '',
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
