import { useState, useEffect } from 'react'
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi'

import { Flex, Box, Text } from '../../Primitives'
import { useFeedback } from '../contexts/FeedbackContext'
import { usePanFinderApi } from '../hooks/usePanFinderApi'

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
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2,
      }}
    >
      <button
        type="button"
        aria-label="Thumbs up"
        style={{
          background: 'none',
          border: 'none',
          cursor: feedbackLoading ? 'not-allowed' : 'pointer',
          color: feedbackStatus === 'positive' ? '#48bb78' : '#a0aec0',
          fontSize: 20,
          opacity: feedbackLoading ? 0.5 : 1,
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
          fontSize: 20,
          opacity: feedbackLoading ? 0.5 : 1,
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
            mt: 1,
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
          fontSize: '12px',
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

function DocumentDetails({ details, isLoading }) {
  const { submitFeedback } = usePanFinderApi()
  const { feedbacks, setFeedback, currentQueryId } = useFeedback()
  const [feedbackStatus, setFeedbackStatus] = useState(null) // 'positive' | 'negative' | 'error' | null
  const [feedbackLoading, setFeedbackLoading] = useState(false)

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
          sx={{ p: 4, borderTop: '1px solid #4a5568', position: 'relative' }}
        >
          <FeedbackButtons
            feedbackLoading={feedbackLoading}
            feedbackStatus={feedbackStatus}
            handleFeedback={handleFeedback}
          />
          <Box sx={{ display: 'grid', gap: 3 }}>
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

            {details.summary && (
              <DocumentField label="Summary">
                <Box
                  sx={{
                    bg: '#2d3748',
                    p: 2,
                    borderRadius: '2px',
                    border: '1px solid #4a5568',
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}
                >
                  <Text
                    sx={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}
                  >
                    {details.summary}
                  </Text>
                </Box>
              </DocumentField>
            )}

            {details.text && (
              <DocumentField label="Content">
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
                    {details.text.length > 500
                      ? `${details.text.slice(0, 500)}...`
                      : details.text}
                  </Text>
                </Box>
              </DocumentField>
            )}

            {details.raw && (
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
                    {typeof details.raw === 'object'
                      ? JSON.stringify(details.raw, null, 2)
                      : details.raw}
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
