import React from 'react'

import { Box, Flex, Text } from '../../Primitives'

function StreamingSteps({ isLoading, streamingSteps, data }) {
  if ((!isLoading && streamingSteps.length === 0) || data) {
    return null
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          p: 2,
        }}
      >
        {streamingSteps.map((step, index) => {
          const isCompleted =
            index < streamingSteps.length - 1 ||
            step.event === 'analysis_completed' ||
            step.event === 'database_query_completed' ||
            step.event === 'results' ||
            step.event === 'error'

          return (
            <Flex
              key={`${step.timestamp}-${step.event}`}
              sx={{
                mb: 2,
                pb: 2,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                opacity: 0,
                transform: 'translateY(10px)',
                animation: 'fadeInUp 0.2s ease-out forwards',
                animationDelay: `${index * 0.05}s`,
              }}
            >
              {/* Progress indicator */}
              <Box
                sx={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  ...(isCompleted
                    ? {
                        backgroundColor: '#48bb78',
                        color: 'white',
                        transform: 'scale(1.05)',
                      }
                    : {
                        border: '2px solid transparent',
                        borderTop: '2px solid #48bb78',
                        borderRight: '2px solid #48bb78',
                        backgroundColor: 'transparent',
                        animation: 'spin 1s linear infinite',
                      }),
                }}
              >
                {isCompleted ? '✓' : ''}
              </Box>
              <Text
                sx={{
                  fontSize: 1,
                  color: '#a0aec0',
                  fontFamily: 'monospace',
                  mb: 0,
                  transition: 'color 0.15s ease',
                }}
              >
                {step.event === 'analysis_started' && 'Analysing your query...'}
                {step.event === 'analysis_completed' && 'Analysis complete'}
                {step.event === 'database_query_started' && 'Fetching data...'}
                {step.event === 'error' && 'Error occurred'}
              </Text>
            </Flex>
          )
        })}
        {isLoading && streamingSteps.length === 0 && (
          <Flex
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              opacity: 0,
              animation: 'fadeIn 0.2s ease-out forwards',
            }}
          >
            <Box
              sx={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTop: '2px solid #48bb78',
                borderRight: '2px solid #48bb78',
                backgroundColor: 'transparent',
                flexShrink: 0,
                animation: 'spin 1s linear infinite',
              }}
            />
            <Text
              sx={{
                fontSize: 1,
                color: '#a0aec0',
                fontFamily: 'monospace',
              }}
            >
              Connecting to server...
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  )
}

export default StreamingSteps
