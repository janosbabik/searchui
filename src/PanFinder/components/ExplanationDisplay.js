import React, { useEffect, useRef } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

import { Box, Flex, Heading, Text } from '../../Primitives'

function ExplanationDisplay({
  explanation,
  isExplanationComplete,
  explanationError,
  isVisible = true,
}) {
  const explanationRef = useRef(null)

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (explanationRef.current && explanation) {
      explanationRef.current.scrollTop = explanationRef.current.scrollHeight
    }
  }, [explanation])

  if (!isVisible || (!explanation && !explanationError)) {
    return null
  }

  return (
    <Box
      sx={{
        mt: 4,
        opacity: 0,
        animation: 'fadeInUp 0.3s ease-out forwards',
        animationDelay: '0.1s',
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Heading as="h3" sx={{ m: 0, fontSize: 2 }}>
          Search Explanation
        </Heading>
      </Flex>

      <Box
        sx={{
          bg: '#1a202c',
          border: '1px solid #2d3748',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {explanationError ? (
          <Flex
            sx={{
              p: 3,
              alignItems: 'center',
              gap: 2,
              color: '#f56565',
            }}
          >
            <FiAlertCircle size={16} />
            <Text sx={{ fontSize: 1, mb: 0 }}>{explanationError}</Text>
          </Flex>
        ) : (
          <Box
            ref={explanationRef}
            sx={{
              p: 3,
              maxHeight: '300px',
              overflowY: 'auto',
              fontSize: 1,
              lineHeight: 1.6,
              color: '#e2e8f0',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#2d3748',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#4a5568',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#718096',
              },
            }}
          >
            {explanation ? (
              <Text
                sx={{
                  mb: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {explanation}
                {!isExplanationComplete && (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: '8px',
                      height: '16px',
                      bg: '#48bb78',
                      ml: 1,
                      animation: 'blink 1s infinite',
                    }}
                  />
                )}
              </Text>
            ) : (
              <Text
                sx={{
                  mb: 0,
                  color: '#a0aec0',
                  fontStyle: 'italic',
                }}
              >
                Generating explanation...
              </Text>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ExplanationDisplay
