import React, { useState } from 'react'

import { Box } from '../Primitives'
import ErrorDisplay from './components/ErrorDisplay'
import ExplanationDisplay from './components/ExplanationDisplay'
import PageHeader from './components/PageHeader'
import QueryDetails from './components/QueryDetails'
import ResultsDisplay from './components/ResultsDisplay'
import SearchForm from './components/SearchForm'
import StreamingSteps from './components/StreamingSteps'
import TurnstileSessionGate from './components/TurnstileSessionGate'
import { useSession } from './contexts/SessionContext'
import { usePanFinderApi } from './hooks/usePanFinderApi'

function PanFinderPage() {
  const [inputValue, setInputValue] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [documentDetails, setDocumentDetails] = useState({})
  const [loadingDetails, setLoadingDetails] = useState(new Set())
  const [pendingSearch, setPendingSearch] = useState(false)
  const { sessionId, error: sessionError } = useSession()

  const {
    data,
    error,
    isLoading,
    streamingSteps,
    explanation,
    explanationError,
    search,
    searchWithStructuredData,
    fetchDocumentDetails,
    createSession: createSessionApi,
  } = usePanFinderApi()

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

    try {
      await search(inputValue)
    } finally {
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
      if (sessionId) {
        handleSearch()
      }
    }
  }

  return (
    <TurnstileSessionGate createSessionApi={createSessionApi}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
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
        <ErrorDisplay error={error || sessionError} />
        <ExplanationDisplay
          explanation={explanation}
          explanationError={explanationError}
        />
        <ResultsDisplay
          data={data}
          expandedRows={expandedRows}
          documentDetails={documentDetails}
          loadingDetails={loadingDetails}
          handleRowExpand={handleRowExpand}
        />
        <QueryDetails data={data} onStructuredSearch={handleStructuredSearch} />
      </Box>
    </TurnstileSessionGate>
  )
}

export default PanFinderPage
