import { useState, useEffect } from 'react'
import { FiThumbsUp, FiThumbsDown, FiEye } from 'react-icons/fi'
import { Flex, Box, Text, Button } from '../../Primitives'
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
          <Text sx={{ color: '#a0aec0', fontSize: '13px' }}>
            Loading document details...
          </Text>
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
          <Text sx={{ color: '#fed7d7', fontSize: '13px' }}>{error}</Text>
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
        alignItems: 'center',
        justifyContent: 'flex-end',
        mt: 2,
        mb: 3,
        gap: 2,
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
            fontSize: '12px',
          }}
        >
          Error submitting feedback
        </Text>
      )}
    </Box>
  )
}

function DocumentField({ label, children }) {
  return (
    <Box>
      <Text
        sx={{
          fontSize: '0.9em',
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

function DocumentDetails({
  details,
  isLoading,
  explanation,
  explanationError,
}) {
  const { submitFeedback, fetchRawDocument } = usePanFinderApi()
  const { feedbacks, setFeedback, currentQueryId } = useFeedback()
  const [feedbackStatus, setFeedbackStatus] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [rawData, setRawData] = useState(null)
  const [rawDataLoading, setRawDataLoading] = useState(false)
  const [rawDataError, setRawDataError] = useState(null)

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
    setRawDataError(null)
    try {
      const rawResult = await fetchRawDocument(details.doi)
      setRawData(rawResult)
    } catch (error) {
      setRawDataError(error.message)
    } finally {
      setRawDataLoading(false)
    }
  }

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
                  fontSize: '13px',
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
                  fontSize: '13px',
                  color: '#e2e8f0',
                  lineHeight: 1.4,
                  fontWeight: 'medium',
                }}
              >
                {details.title}
              </Text>
            </DocumentField>

            {details.facility_name && (
              <DocumentField label="Facility">
                <Text sx={{ fontSize: '13px', color: '#e2e8f0' }}>
                  {details.facility_name}
                </Text>
              </DocumentField>
            )}

            {details.abstract && (
              <DocumentField label="Abstract">
                <Box
                  sx={{
                    bg: '#2d3748',
                    p: 2,
                    borderRadius: '2px',
                    border: '1px solid #4a5568',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  <Text
                    sx={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}
                  >
                    {details.abstract}
                  </Text>
                </Box>
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
                <Box
                  sx={{
                    bg: '#111827',
                    p: 2,
                    borderRadius: '4px',
                    border: '1px solid #4a5568',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
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
                    {typeof rawData === 'object'
                      ? JSON.stringify(rawData, null, 2)
                      : rawData}
                  </pre>
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
