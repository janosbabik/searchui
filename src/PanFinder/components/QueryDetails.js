import React from 'react'

import { Box, Text } from '../../Primitives'

function QueryDetails({ data }) {
  if (!data) {
    return null
  }

  return (
    <Box
      sx={{
        mt: 4,
        bg: '#1a202c',
        borderRadius: '3px',
        border: '1px solid #2d3748',
        overflow: 'hidden',
        opacity: 0,
        animation: 'fadeInUp 0.2s ease-out forwards',
        animationDelay: '0.3s',
      }}
    >
      <details>
        <summary
          style={{
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            color: '#a0aec0',
            backgroundColor: '#2d3748',
            borderBottom: '1px solid #374151',
            userSelect: 'none',
            outline: 'none',
          }}
        >
          Query Details
        </summary>
        <Box
          sx={{
            p: 3,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Text
              sx={{
                mb: 2,
                fontSize: '12px',
                fontWeight: '500',
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Original Query
            </Text>{' '}
            <Box
              sx={{
                bg: '#111827',
                p: 2,
                borderRadius: '4px',
                border: '1px solid #374151',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: 1.5,
                color: '#d1d5db',
                wordBreak: 'break-word',
              }}
            >
              {data.original_query || 'No query available'}
            </Box>
          </Box>
          {data.raw_structured_data && (
            <Box>
              <Text
                sx={{
                  mb: 2,
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#718096',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Structured Data
              </Text>
              <Box
                sx={{
                  bg: '#111827',
                  p: 2,
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  overflow: 'auto',
                }}
              >
                <pre
                  style={{
                    fontSize: '12px',
                    margin: 0,
                    fontFamily: 'monospace',
                    color: '#d1d5db',
                    lineHeight: 1.4,
                  }}
                >
                  {JSON.stringify(data.raw_structured_data, null, 2)}
                </pre>
              </Box>
            </Box>
          )}
        </Box>
      </details>
    </Box>
  )
}

export default QueryDetails
