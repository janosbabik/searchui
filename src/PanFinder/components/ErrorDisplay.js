import React from 'react'

import { Box, Heading, Text } from '../../Primitives'

function ErrorDisplay({ error, isLoading }) {
  if (!error || isLoading) {
    return null
  }

  return (
    <Box
      sx={{
        mt: 3,
        p: [3, 4],
        bg: 'red',
        color: 'white',
        borderRadius: '8px',
        border: '1px solid #e53e3e',
      }}
      role="alert"
    >
      <Heading as="h3" sx={{ mb: 2, fontSize: 3 }}>
        Something went wrong
      </Heading>
      <Text as="p" sx={{ mb: 2 }}>
        {error.message}
      </Text>
      <Text as="p" sx={{ fontSize: 1, opacity: 0.9 }}>
        Please try again with a different query or check your connection.
      </Text>
    </Box>
  )
}

export default ErrorDisplay
