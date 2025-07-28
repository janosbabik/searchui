import React, { useState } from 'react'

import { usePanFinderApi } from '../Api/usePanFinderApi'
import { Box } from '../Primitives'
import ErrorDisplay from './components/ErrorDisplay'
import PageHeader from './components/PageHeader'
import QueryDetails from './components/QueryDetails'
import ResultsDisplay from './components/ResultsDisplay'
import SearchForm from './components/SearchForm'
import StreamingSteps from './components/StreamingSteps'

function PanFinderPage() {
  const [inputValue, setInputValue] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [documentDetails, setDocumentDetails] = useState({})
  const [loadingDetails, setLoadingDetails] = useState(new Set())
  const {
    data,
    error,
    isLoading,
    streamingSteps,
    search,
    fetchDocumentDetails,
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

  const handleSearch = () => {
    if (inputValue.trim()) {
      search(inputValue.trim())
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
      handleSearch()
    }
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
      <PageHeader />
      <SearchForm
        inputValue={inputValue}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        setInputValue={setInputValue}
      />
      <StreamingSteps
        isLoading={isLoading}
        streamingSteps={streamingSteps}
        data={data}
      />
      <ErrorDisplay error={error} isLoading={isLoading} />
      <ResultsDisplay
        data={data}
        expandedRows={expandedRows}
        documentDetails={documentDetails}
        loadingDetails={loadingDetails}
        handleRowExpand={handleRowExpand}
      />
      <QueryDetails data={data} />
    </Box>
  )
}

export default PanFinderPage
