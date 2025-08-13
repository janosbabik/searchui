import React, { useState } from 'react'

import { Box, Heading } from '../Primitives'
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
import FacilityList from '../Home/Facilites'

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
    reset,
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

  function handleClear() {
    setInputValue('')
    setExpandedRows(new Set())
    setDocumentDetails({})
    setLoadingDetails(new Set())
    setPendingSearch(false) // Reset pending search state
    reset()
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
          handleClear={handleClear}
          hasResults={!!data}
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
          hasExplanation={!!explanation}
        />
        <QueryDetails data={data} onStructuredSearch={handleStructuredSearch} />

        <Box
          sx={{
            mt: 4,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            '& ul': {
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            },
            '& li': {
              textAlign: 'center',
            },
          }}
        >
          <Heading
            sx={{
              mb: 2,
              textAlign: 'center',
              fontSize: '1.25rem',
            }}
          >
            Open Data from facilities
          </Heading>
          <FacilityList only={['ESS', 'ESRF', 'ILL', 'PSI', 'MAXIV']} />
        </Box>
      </Box>
    </TurnstileSessionGate>
  )
}

export default PanFinderPage
