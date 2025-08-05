import { parse } from 'marked'
import React, { useEffect, useRef } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

import { Box, Flex, Text } from '../../Primitives'

function ExplanationDisplay({ explanation, explanationError }) {
  const explanationBoxRef = useRef(null)

  // Scroll the page to follow the explanation box as it grows
  useEffect(() => {
    if (explanationBoxRef.current && explanation) {
      const explanationBox = explanationBoxRef.current
      const rect = explanationBox.getBoundingClientRect()
      const windowHeight = window.innerHeight

      if (rect.bottom > windowHeight) {
        const scrollAmount = rect.bottom - windowHeight + 20
        window.scrollBy({
          top: scrollAmount,
          behavior: 'smooth',
        })
      }
    }
  }, [explanation])

  if (!explanation && !explanationError) {
    return null
  }

  return (
    <Box
      ref={explanationBoxRef}
      sx={{
        mt: 3,
        opacity: 0,
        animation: 'fadeInUp 0.3s ease-out forwards',
      }}
    >
      <Box
        sx={{
          bg: '#0c0f16ff',
          border: '1px solid #2d3748',
          borderRadius: '8px',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderColor: '#4a5568',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
          },
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
          <Box sx={{ p: 3 }}>
            {explanation ? (
              <Text
                sx={{
                  '& *': {
                    color: 'inherit !important',
                  },
                  fontSize: 1,
                }}
                dangerouslySetInnerHTML={{
                  __html: parse(explanation || ''),
                }}
              />
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
