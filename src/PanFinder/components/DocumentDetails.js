import { useState, useEffect } from 'react'
import { FiThumbsUp, FiThumbsDown, FiEye, FiDownload } from 'react-icons/fi'
import { Flex, Box, Text, Button } from '../../Primitives'
import { useDocumentData } from '../contexts/DocumentDataContext'
import { useFeedback } from '../contexts/FeedbackContext'
import { usePanFinderApi } from '../hooks/usePanFinderApi'
import ExplanationDisplay from './ExplanationDisplay'

function LoadingRow() {
  return (
    <tr>
      <td colSpan="4" style={{ padding: '16px', textAlign: 'center' }}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Box
            sx={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTop: '2px solid #48bb78',
              borderRight: '2px solid #48bb78',
              backgroundColor: 'transparent',
              flexShrink: 0,
              animation: 'spin 1s linear infinite',
            }}
          />
          <Text sx={{ color: '#a0aec0' }}>Loading document details...</Text>
        </Flex>
      </td>
    </tr>
  )
}

function ErrorRow({ error }) {
  return (
    <tr>
      <td colSpan="4" style={{ padding: '16px' }}>
        <Box sx={{ bg: '#742a2a', p: 3, borderRadius: '4px' }}>
          <Text sx={{ color: '#fed7d7' }}>{error}</Text>
        </Box>
      </td>
    </tr>
  )
}

function FeedbackButtons({ feedbackLoading, feedbackStatus, handleFeedback }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Box
        sx={{
          background:
            'linear-gradient(135deg, rgba(36, 114, 179, 0.2) 0%, rgba(100, 110, 177, 0.25) 25%, rgba(187, 70, 119, 0.2) 75%, rgba(12, 15, 22, 0.95) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
        }}
      >
        <Text
          sx={{
            fontSize: '13px',
            color: '#a0aec0',
          }}
        >
          Was this what you were looking for?
        </Text>
        <button
          type="button"
          aria-label="Thumbs up"
          style={{
            background: 'none',
            border: 'none',
            cursor: feedbackLoading ? 'not-allowed' : 'pointer',
            color: feedbackStatus === 'positive' ? '#48bb78' : '#a0aec0',
            fontSize: 18,
            opacity: feedbackLoading ? 0.5 : 1,
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          disabled={feedbackLoading}
          onClick={() => handleFeedback('positive')}
        >
          <FiThumbsUp />
        </button>
        <button
          type="button"
          aria-label="Thumbs down"
          style={{
            background: 'none',
            border: 'none',
            cursor: feedbackLoading ? 'not-allowed' : 'pointer',
            color: feedbackStatus === 'negative' ? '#e53e3e' : '#a0aec0',
            fontSize: 18,
            opacity: feedbackLoading ? 0.5 : 1,
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          disabled={feedbackLoading}
          onClick={() => handleFeedback('negative')}
        >
          <FiThumbsDown />
        </button>
        {feedbackStatus === 'error' && (
          <Text
            sx={{
              color: '#e53e3e',
              fontSize: '13px',
            }}
          >
            Error submitting feedback
          </Text>
        )}
      </Box>
    </Box>
  )
}

function DocumentField({ label, children }) {
  return (
    <Box>
      <Text
        sx={{
          fontSize: '1em',
          fontWeight: 'bold',
          color: '#a0aec0',
          mb: 1,
        }}
      >
        {label}
      </Text>
      {children}
    </Box>
  )
}

function DocumentDetails({ details, isLoading, doi, statisticId }) {
  const { submitFeedback, fetchRawDocument } = usePanFinderApi()
  const { feedbacks, setFeedback, currentQueryId } = useFeedback()
  const {
    rawDataCache,
    rawDataErrors,
    explanations,
    explanationErrors,
    setRawData,
    setRawDataError,
  } = useDocumentData()
  const [feedbackStatus, setFeedbackStatus] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [rawDataLoading, setRawDataLoading] = useState(false)

  const rawData = details?.doi ? rawDataCache[details.doi] : null
  const rawDataError = details?.doi ? rawDataErrors[details.doi] : null

  // Get explanation from context using statisticId and doi
  const explanationKey = `${statisticId}|${doi}`
  const explanation = explanations[explanationKey]
  const explanationError = explanationErrors[explanationKey]

  useEffect(() => {
    if (details?.doi && currentQueryId && feedbacks) {
      const stored = feedbacks[`${currentQueryId}|${details.doi}`]
      if (stored === 'positive' || stored === 'negative') {
        setFeedbackStatus(stored)
      } else {
        setFeedbackStatus(null)
      }
    }
  }, [details?.doi, feedbacks, currentQueryId])

  const handleFeedback = async (type) => {
    if (!details?.doi || !currentQueryId) {
      return
    }
    setFeedbackLoading(true)
    setFeedbackStatus(null)
    try {
      await submitFeedback({
        statistic_id: currentQueryId,
        feedback_type: type,
        doi: details.doi,
      })
      setFeedbackStatus(type)
      setFeedback(currentQueryId, details.doi, type)
    } catch {
      setFeedbackStatus('error')
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleFetchRawData = async () => {
    if (!details?.doi) {
      return
    }
    setRawDataLoading(true)
    setRawDataError(details.doi, null)
    try {
      const rawResult = await fetchRawDocument(details.doi)
      setRawData(details.doi, rawResult)
    } catch (error) {
      setRawDataError(details.doi, error.message)
    } finally {
      setRawDataLoading(false)
    }
  }

  const handleDownloadRawData = () => {
    if (!rawData) return

    const jsonString =
      typeof rawData === 'object'
        ? JSON.stringify(rawData, null, 2)
        : String(rawData)

    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `raw-data-${details.doi.replace(/\//g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Safely stringify and truncate large raw data
  const getRawDataDisplay = () => {
    if (!rawData) return null

    try {
      const jsonString =
        typeof rawData === 'object'
          ? JSON.stringify(rawData, null, 2)
          : String(rawData)

      const maxLength = 50000 // ~50KB limit for display
      if (jsonString.length > maxLength) {
        const truncated = jsonString.slice(0, maxLength)
        return {
          content: truncated,
          isTruncated: true,
          originalLength: jsonString.length,
        }
      }

      return {
        content: jsonString,
        isTruncated: false,
        originalLength: jsonString.length,
      }
    } catch (error) {
      return {
        content: 'Error: Unable to display raw data',
        isTruncated: false,
        originalLength: 0,
      }
    }
  }

  const rawDataDisplay = getRawDataDisplay()

  if (isLoading) {
    return <LoadingRow />
  }
  if (details?.error) {
    return <ErrorRow error={details.error} />
  }
  if (!details) {
    return null
  }

  return (
    <tr>
      <td
        colSpan="5"
        style={{ padding: 0, backgroundColor: '#1a202c', position: 'relative' }}
      >
        <Box
          sx={{
            p: 4,
            paddingTop: 2,
            paddingBottom: 2,
            borderTop: '1px solid #4a5568',
            position: 'relative',
          }}
        >
          <ExplanationDisplay
            explanation={explanation}
            explanationError={explanationError}
          />
          <FeedbackButtons
            feedbackLoading={feedbackLoading}
            feedbackStatus={feedbackStatus}
            handleFeedback={handleFeedback}
          />
          <Box sx={{ display: 'grid', gap: 2 }}>
            <DocumentField label="DOI">
              <Text
                sx={{
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                }}
              >
                <a
                  href={`https://doi.org/${details.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#63b3ed',
                    textDecoration: 'none',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.textDecoration = 'underline'
                  }}
                  onFocus={(e) => {
                    e.target.style.textDecoration = 'underline'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.textDecoration = 'none'
                  }}
                  onBlur={(e) => {
                    e.target.style.textDecoration = 'none'
                  }}
                >
                  {details.doi}
                </a>
              </Text>
            </DocumentField>

            <DocumentField label="Title">
              <Text
                sx={{
                  color: '#e2e8f0',
                }}
              >
                {details.title}
              </Text>
            </DocumentField>

            {details.facility_name && (
              <DocumentField label="Facility">
                <Text sx={{ color: '#e2e8f0' }}>{details.facility_name}</Text>
              </DocumentField>
            )}

            {details.abstract && (
              <DocumentField label="Abstract">
                <Text sx={{ color: '#e2e8f0' }}>{details.abstract}</Text>
              </DocumentField>
            )}

            {!details.raw && !rawData && (
              <Button
                variant="action"
                sx={{
                  p: 1,
                  ml: 0,
                  fontSize: '12px',
                  alignItems: 'center',
                  gap: 2,
                }}
                title="Show Raw Data"
                onClick={handleFetchRawData}
                disabled={rawDataLoading}
              >
                {rawDataLoading ? (
                  <>
                    <Box
                      sx={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        border: '2px solid transparent',
                        borderTop: '2px solid currentColor',
                        borderRight: '2px solid currentColor',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Loading...
                  </>
                ) : (
                  <>
                    <FiEye size={14} />
                    Show Raw Data
                  </>
                )}
              </Button>
            )}
            {rawDataError && (
              <DocumentField label="Raw Data">
                <Box sx={{ bg: '#742a2a', p: 3, borderRadius: '4px' }}>
                  <Text sx={{ color: '#fed7d7', fontSize: '13px' }}>
                    Error loading raw data: {rawDataError}
                  </Text>
                </Box>
              </DocumentField>
            )}
            {rawData && (
              <DocumentField label="Raw Data">
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      bg: '#111827',
                      p: 2,
                      borderRadius: '4px',
                      border: '1px solid #4a5568',
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'sticky',
                        top: 0,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        bg: 'transparent',
                        pb: 2,
                        mb: 2,
                        zIndex: 1,
                        gap: 2,
                      }}
                    >
                      {rawDataDisplay?.isTruncated && (
                        <Box
                          sx={{
                            p: 2,
                            bg: '#2d3748',
                            borderRadius: '4px',
                            flex: 1,
                          }}
                        >
                          <Text sx={{ color: '#f6ad55', fontSize: '12px' }}>
                            ⚠️ Content truncated for performance. Showing first{' '}
                            {Math.round(50000 / 1024)}KB of{' '}
                            {Math.round(rawDataDisplay.originalLength / 1024)}KB
                          </Text>
                        </Box>
                      )}
                      <button
                        type="button"
                        onClick={handleDownloadRawData}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#63b3ed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                        }}
                        title="Download full raw data as JSON"
                      >
                        <FiDownload size={14} />
                        Download
                      </button>
                    </Box>
                    <pre
                      style={{
                        fontSize: '11px',
                        color: '#d1d5db',
                        margin: 0,
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {rawDataDisplay?.content || 'No data available'}
                    </pre>
                  </Box>
                </Box>
              </DocumentField>
            )}
          </Box>
        </Box>
      </td>
    </tr>
  )
}

export default DocumentDetails
