import React, { useState } from 'react'

import { Box } from '../Primitives'
import ErrorDisplay from './components/ErrorDisplay'
import FacilitiesSection from './components/FacilitiesSection'
import PanFinderFooter from './components/PanFinderFooter'
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
  const [explanations, setExplanations] = useState({})
  const [explanationErrors, setExplanationErrors] = useState({})
  const { sessionId, error: sessionError } = useSession()

  const {
    data,
    error,
    isLoading,
    streamingSteps,
    search,
    searchWithStructuredData,
    fetchDocumentDetails,
    explainDocument,
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

      // Fetch explanation if not already loaded and we have a statistic ID
      const explanationKey = `${data?.id}|${doi}`
      if (data?.id && !explanations[explanationKey]) {
        setExplanations((prev) => ({ ...prev, [explanationKey]: ' ' }))
        setExplanationErrors((prev) => ({ ...prev, [explanationKey]: null }))

        const controller = new AbortController()

        const handleEvent = (event) => {
          if (event.event === 'explanation_chunk') {
            setExplanations((prev) => {
              const current = prev[explanationKey] || ''
              if (current === ' ')
                return { ...prev, [explanationKey]: event.data?.content || '' }
              return {
                ...prev,
                [explanationKey]: current + (event.data?.content || ''),
              }
            })
          } else if (event.event === 'error') {
            setExplanationErrors((prev) => ({
              ...prev,
              [explanationKey]:
                event.data?.message || 'Failed to generate explanation',
            }))
          }
        }

        try {
          await explainDocument(data.id, doi, handleEvent, controller.signal)
        } catch (error_) {
          if (error_.name !== 'AbortError') {
            setExplanationErrors((prev) => ({
              ...prev,
              [explanationKey]:
                error_.message || 'Failed to generate explanation',
            }))
          }
        }
      }
    }
  }

  const handleSearch = async () => {
    if (!inputValue.trim()) {
      return
    }

    // Clear previous results state to prepare for new search
    setExpandedRows(new Set())
    setDocumentDetails({})
    setLoadingDetails(new Set())
    setExplanations({})
    setExplanationErrors({})

    await search(inputValue)
  }

  const handleStructuredSearch = (id, structuredData) => {
    // Clear previous results state to prepare for new search
    setExpandedRows(new Set())
    setDocumentDetails({})
    setLoadingDetails(new Set())
    setExplanations({})
    setExplanationErrors({})
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
    setExplanations({})
    setExplanationErrors({})
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
          isLoading={isLoading}
          setInputValue={setInputValue}
          handleClear={handleClear}
          hasResults={!!data}
          disabled={!sessionId}
        />

        <StreamingSteps streamingSteps={streamingSteps} />
        <ErrorDisplay error={error || sessionError} />
        <ResultsDisplay
          data={data}
          expandedRows={expandedRows}
          documentDetails={documentDetails}
          loadingDetails={loadingDetails}
          handleRowExpand={handleRowExpand}
          explanations={explanations}
          explanationErrors={explanationErrors}
        />
        <QueryDetails data={data} onStructuredSearch={handleStructuredSearch} />

        <FacilitiesSection only={['ESS', 'ESRF', 'ILL', 'PSI', 'MAXIV']} />
        <PanFinderFooter />
      </Box>
    </TurnstileSessionGate>
  )
}

export default PanFinderPage
