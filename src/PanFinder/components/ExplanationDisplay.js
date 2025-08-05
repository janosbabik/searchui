import { parse } from 'marked'
import React, { useEffect, useRef } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

import { Box, Flex, Text } from '../../Primitives'

// Helper for fade in animation styles
const fadeInAnimation = (delay, duration = '0.3s') => ({
  opacity: 0,
  animation: `fadeInUp ${duration} ease-out forwards`,
  animationDelay: delay,
})

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

  // Pre-calculate animation styles
  const containerAnimation = fadeInAnimation('0.1s')
  const boxAnimation = fadeInAnimation('0.4s')

  return (
    <Box ref={explanationBoxRef} sx={containerAnimation}>
      <Box
        sx={{
          bg: '#0c0f16ff',
          border: '1px solid #2d3748',
          borderRadius: '3px',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          ...boxAnimation,
          '&:hover': {
            borderColor: '#4a5568',
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
