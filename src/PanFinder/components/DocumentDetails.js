import React from 'react'

import { Box, Flex, Text } from '../../Primitives'

function DocumentDetails({ details, isLoading }) {
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
      <td colSpan="4" style={{ padding: 0, backgroundColor: '#1a202c' }}>
        <Box sx={{ p: 4, borderTop: '1px solid #4a5568' }}>
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
