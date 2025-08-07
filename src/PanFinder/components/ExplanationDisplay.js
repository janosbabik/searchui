import { Renderer, marked } from 'marked'
import React, { useEffect, useRef } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

import { Box, Flex, Text, Heading } from '../../Primitives'

const renderer = new Renderer()
const linkRenderer = renderer.link
renderer.link = (href, title, text) => {
  const html = linkRenderer.call(renderer, href, title, text)
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ')
}

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
        mt: 1,
        opacity: 0,
        animation: 'fadeInUp 0.5s ease-out forwards',
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Heading as="h2" sx={{ m: 0 }}>
          Relevance Explanation
        </Heading>
      </Flex>
      <Box
        sx={{
          bg: '#0c0f16ff',
          border: '1px solid #2d3748',
          borderRadius: '4px',
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
          <Box sx={{ pt: 0, pr: 3, pb: 0, pl: 3 }}>
            {explanation ? (
              <Text
                sx={{
                  '& *': {
                    color: 'inherit !important',
                  },
                }}
                dangerouslySetInnerHTML={{
                  __html: marked(explanation || '', { renderer }),
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
