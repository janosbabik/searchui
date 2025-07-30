import React, { useState, useEffect } from 'react'
import { Box, Flex, Text } from '../../Primitives'
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi'
import { usePanFinderApi } from '../../Api/usePanFinderApi'
import { useFeedback } from '../../Api/FeedbackContext'

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
    if (!details?.doi || !currentQueryId) return
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
    } catch (e) {
      setFeedbackStatus('error')
    } finally {
      setFeedbackLoading(false)
    }
  }
  if (isLoading) {
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

  if (details?.error) {
    return (
      <tr>
        <td colSpan="4" style={{ padding: '16px' }}>
          <Box sx={{ bg: '#742a2a', p: 3, borderRadius: '4px' }}>
            <Text sx={{ color: '#fed7d7', fontSize: '13px' }}>
              Error loading details: {details.error}
            </Text>
          </Box>
        </td>
      </tr>
    )
  }

  if (!details) {
    return null
  }

  return (
    <tr>
      <td
        colSpan="4"
        style={{ padding: 0, backgroundColor: '#1a202c', position: 'relative' }}
      >
        <Box
          sx={{ p: 4, borderTop: '1px solid #4a5568', position: 'relative' }}
        >
          {/* Feedback icons top right */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
            }}
          >
            <button
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
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* DOI */}
            <Box>
              <Text
                sx={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#a0aec0',
                  mb: 1,
                }}
              >
                DOI
              </Text>
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
            </Box>

            {/* Title */}
            <Box>
              <Text
                sx={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#a0aec0',
                  mb: 1,
                }}
              >
                Title
              </Text>
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
            </Box>

            {/* Facility */}
            {details.facility_name && (
              <Box>
                <Text
                  sx={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#a0aec0',
                    mb: 1,
                  }}
                >
                  Facility
                </Text>
                <Text sx={{ fontSize: '13px', color: '#e2e8f0' }}>
                  {details.facility_name}
                </Text>
              </Box>
            )}

            {/* Summary */}
            {details.summary && (
              <Box>
                <Text
                  sx={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#a0aec0',
                    mb: 1,
                  }}
                >
                  Summary
                </Text>
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
              </Box>
            )}

            {/* Text Content */}
            {details.text && (
              <Box>
                <Text
                  sx={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#a0aec0',
                    mb: 1,
                  }}
                >
                  Content
                </Text>
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
              </Box>
            )}

            {/* Raw Data */}
            {details.raw && (
              <Box>
                <Text
                  sx={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#a0aec0',
                    mb: 1,
                  }}
                >
                  Raw Data
                </Text>
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
              </Box>
            )}
          </Box>
        </Box>
      </td>
    </tr>
  )
}

export default DocumentDetails
