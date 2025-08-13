import React from 'react'

import { Box, Text, Flex } from '../../Primitives'

function PanFinderFooter() {
  return (
    <Box
      as="footer"
      sx={{
        mt: 6,
        mb: 0,
        mx: 'auto',
        maxWidth: '900px',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          background: (theme) =>
            `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.secondary}10 50%, ${theme.colors.ternary}15 100%)`,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'rgba(100, 110, 177, 0.2)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          overflow: 'hidden',
          '::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background:
              'linear-gradient(90deg, transparent 0%, #2472b3 20%, #646eb1 50%, #bb4677 80%, transparent 100%)',
            opacity: 0.6,
          },
        }}
      >
        <Flex
          sx={{
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            px: [3, 3, 3],
            py: [3, 3, 3],
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: [1, 2, 2],
              fontWeight: 'bold',
              letterSpacing: '0.02em',
              color: 'textVivid',
              mb: 1,
            }}
          >
            <Box
              as="span"
              sx={{
                background:
                  'linear-gradient(135deg, #2472b3 0%, #646eb1 50%, #bb4677 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PaN-Finder
            </Box>
          </Box>

          <Box sx={{ maxWidth: '600px' }}>
            <Text
              as="p"
              sx={{
                m: 0,
                fontSize: [1, 1, 2],
                lineHeight: 1.6,
                color: 'text',
                opacity: 0.85,
                fontWeight: 'medium',
                letterSpacing: '0.01em',
              }}
            >
              This application is currently in active development. Please
              carefully{' '}
              <Box
                as="span"
                sx={{
                  fontWeight: 'bold',
                  color: (theme) => theme.colors.secondary,
                }}
              >
                verify all results
              </Box>{' '}
              before use.
            </Text>
            <Text
              as="p"
              sx={{
                m: 0,
                mt: 2,
                fontSize: [0, 1, 1],
                lineHeight: 1.5,
                color: 'text',
                opacity: 0.7,
                fontStyle: 'italic',
              }}
            >
              Your constructive feedback helps us improve • Thank you for
              testing PaN-Finder
            </Text>
          </Box>

          <Box
            sx={{
              width: '60px',
              height: '2px',
              borderRadius: '1px',
              background:
                'linear-gradient(90deg, transparent 0%, #2472b3 20%, #646eb1 50%, #bb4677 80%, transparent 100%)',
              opacity: 0.4,
            }}
          />
        </Flex>
      </Box>
    </Box>
  )
}

export default PanFinderFooter
