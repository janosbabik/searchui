import React, { useState, useEffect, useRef, useCallback } from 'react'

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
  const [token, setToken] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [sessionCreating, setSessionCreating] = useState(false)
  const [widgetRendered, setWidgetRendered] = useState(false)
  const sessionIdRef = useRef(sessionId)
  const {
    turnstile,
    isLoading: turnstileLoading,
    error: turnstileError,
    scriptLoaded,
    reset: resetTurnstile,
    removeWidget,
  } = useTurnstile()
  const turnstileRef = useRef(null)

  // Handle session invalidation
  const handleSessionInvalid = useCallback(() => {
    setSessionId(null)
    resetTurnstile()
    // Widget will be re-rendered when sessionId becomes null
  }, [resetTurnstile])

  const {
    data,
    error,
    isLoading,
    streamingSteps,
    search,
    searchWithStructuredData,
    fetchDocumentDetails,
    createSession,
  } = usePanFinderApi(handleSessionInvalid)

  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  // Handle Turnstile token and create session
  useEffect(() => {
    const handleSessionCreation = async () => {
      if (token && !sessionId && !sessionCreating) {
        setSessionCreating(true)
        resetTurnstile()

        try {
          const response = await createSession(token)
          setSessionId(response.session_id)
          setToken(null) // Clear token after creating session
        } catch {
          setToken(null)
        } finally {
          setSessionCreating(false)
        }
      }
    }

    handleSessionCreation()
  }, [token, sessionId, sessionCreating, createSession, resetTurnstile])

  // Render the managed widget once the script is loaded and when session is invalid
  useEffect(() => {
    if (
      turnstile &&
      turnstileRef.current &&
      !sessionId &&
      scriptLoaded &&
      !widgetRendered
    ) {
      // Clear any existing widget first
      turnstileRef.current.innerHTML = ''

      // Render new widget
      turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => setToken(token),
        'error-callback': (error) => {
          setToken(null) // Reset token on error
        },
      })
      setWidgetRendered(true)
    }

    if (sessionId && widgetRendered) {
      // Clean up widget when session is active
      if (turnstileRef.current) {
        removeWidget('turnstile-widget')
        turnstileRef.current.innerHTML = ''
      }
      setWidgetRendered(false)
    }
  }, [turnstile, sessionId, scriptLoaded, widgetRendered, removeWidget]) // Re-run when dependencies change

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

    // Check if we have a valid session
    if (!sessionIdRef.current) {
      return
    }

    setPendingSearch(true)

    try {
      await search(inputValue, sessionIdRef.current)
    } finally {
      setPendingSearch(false)
    }
  }

  const handleStructuredSearch = (id, structuredData) => {
    if (sessionIdRef.current) {
      searchWithStructuredData(id, structuredData, sessionIdRef.current)
    }
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
      if (sessionId) {
        handleSearch()
      }
    }
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', position: 'relative' }}>
      {/* Main content with conditional blur */}
      <Box
        sx={{
          filter: sessionId ? 'none' : 'blur(4px)',
          transition: 'filter 0.3s ease-in-out',
          pointerEvents: sessionId ? 'auto' : 'none',
        }}
      >
        <PageHeader />

        <SearchForm
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          handleSubmit={handleSubmit}
          isLoading={isLoading || pendingSearch}
          setInputValue={setInputValue}
          disabled={!sessionId}
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

      {/* Overlay with Turnstile widget when no session */}
      {!sessionId && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 2,
              p: 4,
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '400px',
            }}
          >
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Box sx={{ fontSize: '1.25rem', fontWeight: 'medium', mb: 1 }}>
                Security Verification Required
              </Box>
              <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                Please complete the security challenge to continue
              </Box>
            </Box>

            {turnstileLoading ? (
              <Box
                sx={{
                  mt: 2,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                }}
              >
                Loading security challenge...
              </Box>
            ) : turnstileError ? (
              <Box
                sx={{
                  mt: 2,
                  color: 'error.main',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                }}
              >
                {turnstileError.message ||
                  'Failed to load security challenge. Please refresh the page.'}
              </Box>
            ) : (
              <div ref={turnstileRef} id="turnstile-widget" />
            )}

            {sessionCreating && (
              <Box
                sx={{
                  mt: 2,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                }}
              >
                Creating secure session...
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default PanFinderPage
