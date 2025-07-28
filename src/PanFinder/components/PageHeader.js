import React from 'react'

import { Heading, Text } from '../../Primitives'

function PageHeader() {
  return (
    <>
      <Heading
        as="h1"
        sx={{
          textAlign: 'center',
          mb: 3,
          fontSize: [4, 5, 6],
          background:
            'linear-gradient(135deg, #2472b3 0%, #646eb1 50%, #bb4677 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
        }}
      >
        PaN-Finder
      </Heading>
      <Text
        as="p"
        sx={{
          textAlign: 'center',
          mb: 4,
          fontSize: [1, 2, 2],
          fontWeight: 'medium',
          color: 'text',
          opacity: 0.8,
          letterSpacing: '0.025em',
          lineHeight: 1.6,
          maxWidth: '600px',
          mx: 'auto',
        }}
      >
        Search through scientific datasets and research publications
      </Text>
    </>
  )
}

export default PageHeader
