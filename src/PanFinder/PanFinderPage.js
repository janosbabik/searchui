import React, { useState, useEffect, useRef } from 'react'

import { usePanFinderApi } from '../Api/usePanFinderApi'
import { Box } from '../Primitives'
import ErrorDisplay from './components/ErrorDisplay'
import PageHeader from './components/PageHeader'
import QueryDetails from './components/QueryDetails'
import ResultsDisplay from './components/ResultsDisplay'
import SearchForm from './components/SearchForm'
import StreamingSteps from './components/StreamingSteps'
import { useTurnstile } from './hooks/useTurnstile'

const TURNSTILE_SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY

function PanFinderPage() {
  const [inputValue, setInputValue] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [documentDetails, setDocumentDetails] = useState({})
  const [loadingDetails, setLoadingDetails] = useState(new Set())
  const [pendingSearch, setPendingSearch] = useState(false)
  const [turnstileError, setTurnstileError] = useState(null)
  const [token, setToken] = useState(null)
  const tokenRef = useRef(token)
  const {
    data,
    error,
    isLoading,
    streamingSteps,
    setStreamingSteps,
    search,
    searchWithStructuredData,
    fetchDocumentDetails,
  } = usePanFinderApi()
  const turnstile = useTurnstile()
  const turnstileRef = useRef(null)

  // Keep tokenRef in sync with token state
  useEffect(() => {
    tokenRef.current = token
  }, [token])

  // Render the invisible widget once the script is loaded
  useEffect(() => {
    if (turnstile && turnstileRef.current) {
      turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        size: 'invisible',
        'error-callback': (error) => {
          setTurnstileError(error)
          setToken(null) // Reset token on error
        },
      })
      turnstile.execute(turnstileRef.current, {
        callback: (token) => setToken(token),
      })
    }
  }, [turnstile])

  const handleRowExpand = async (doi) => {
    const newExpandedRows = new Set(expandedRows)

    if (expandedRows.has(doi)) {
      // Collapse the row
      newExpandedRows.delete(doi)
      setExpandedRows(newExpandedRows)
    } else {
      // Expand the row
      newExpandedRows.add(doi)
      setExpandedRows(newExpandedRows)

      // Fetch document details if not already loaded
      if (!documentDetails[doi]) {
        const newLoadingDetails = new Set(loadingDetails)
        newLoadingDetails.add(doi)
        setLoadingDetails(newLoadingDetails)

        try {
          const details = await fetchDocumentDetails(doi)
          setDocumentDetails((prev) => ({ ...prev, [doi]: details }))
        } catch (error_) {
          setDocumentDetails((prev) => ({
            ...prev,
            [doi]: { error: error_.message },
          }))
        } finally {
          const newLoadingDetailsAfter = new Set(loadingDetails)
          newLoadingDetailsAfter.delete(doi)
          setLoadingDetails(newLoadingDetailsAfter)
        }
      }
    }
  }

  const handleSearch = async () => {
    if (pendingSearch || !inputValue.trim()) {
      return // Prevent multiple requests if already pending
    }

    setPendingSearch(true)

    if (!tokenRef.current) {
      setStreamingSteps((prev) => [...prev, { event: 'waiting_turnstile' }])
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (tokenRef.current) {
            clearInterval(interval)
            resolve()
          }
        }, 200)
      })
    }

    try {
      await search(inputValue, tokenRef.current)
    } finally {
      setToken(null) // Reset token after search
      if (turnstileRef.current) {
        turnstile.reset(turnstileRef.current) // Reset Turnstile widget
      }
      setPendingSearch(false)
    }
  }

  const handleStructuredSearch = (id, structuredData) => {
    searchWithStructuredData(id, structuredData)
  }

  function handleSubmit(evt) {
    evt.preventDefault()
    handleSearch()
  }

  function handleInputChange(evt) {
    setInputValue(evt.target.value)
  }

  function handleKeyDown(evt) {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault()
      handleSearch()
    }
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
      {/* Cloudflare Turnstile invisible widget */}
      <div ref={turnstileRef} id="turnstile-widget" />

      <PageHeader />
      <SearchForm
        inputValue={inputValue}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        handleSubmit={handleSubmit}
        isLoading={isLoading || pendingSearch}
        setInputValue={setInputValue}
      />
      <StreamingSteps streamingSteps={streamingSteps} />
      <ErrorDisplay error={error || turnstileError} />
      <ResultsDisplay
        data={data}
        expandedRows={expandedRows}
        documentDetails={documentDetails}
        loadingDetails={loadingDetails}
        handleRowExpand={handleRowExpand}
      />
      <QueryDetails data={data} onStructuredSearch={handleStructuredSearch} />
    </Box>
  )
}

export default PanFinderPage
