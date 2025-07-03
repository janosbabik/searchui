import { useState, useCallback } from 'react'

const PAN_FINDER_API_BASE =
  process.env.REACT_APP_PAN_FINDER_API || 'http://127.0.0.1:8080'

// Custom fetcher for POST requests
const postFetcher = async (url, data) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (response.ok) {
    return response.json()
  }

  throw new Error(`HTTP ${response.status}: ${response.statusText}`)
}

const usePanFinderApi = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const search = useCallback(async (query) => {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      setError(new Error('Query is required and must be a non-empty string'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const searchData = { query: query.trim() }
      const result = await postFetcher(
        `${PAN_FINDER_API_BASE}/search`,
        searchData,
      )
      setData(result)
      return result
    } catch (error_) {
      setError(error_)
      setData(null)
      throw error_
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    data,
    error,
    isLoading,
    search,
    reset,
  }
}

export { usePanFinderApi }
