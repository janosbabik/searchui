import { Input } from '@rebass/forms/styled-components'
import React, { useState } from 'react'
import { FiSearch } from 'react-icons/fi'

import { usePanFinderApi } from '../Api/usePanFinderApi'
import { Heading, Flex, Button, Box, Text } from '../Primitives'

function PanFinderPage() {
  const [inputValue, setInputValue] = useState('')
  const { data, error, isLoading, search } = usePanFinderApi()

  function handleSubmit(evt) {
    evt.preventDefault()
    if (inputValue.trim()) {
      search(inputValue.trim())
    }
  }

  function handleInputChange(evt) {
    setInputValue(evt.target.value)
  }

  return (
    <div>
      <Heading as="h1" variant="display">
        PaN-Finder
      </Heading>
      <Box as="form" onSubmit={handleSubmit} sx={{ my: 4 }}>
        <Text as="p" sx={{ mt: 0, mb: 2, fontStyle: 'italic' }}>
          Enter your search query:
        </Text>
        <Flex
          sx={{
            alignSelf: 'center',
            flex: '1 1 0%',
            maxWidth: '30rem',
            fontSize: 3,
          }}
        >
          <Input
            value={inputValue}
            onChange={handleInputChange}
            mr={2}
            placeholder="Enter your search term..."
          />
          <Button aria-label="Search" type="submit" disabled={isLoading}>
            <FiSearch />
          </Button>
        </Flex>
      </Box>

      {isLoading && (
        <Text sx={{ textAlign: 'center', fontStyle: 'italic' }}>
          Searching...
        </Text>
      )}

      {error && (
        <Box sx={{ mt: 3, p: 3, bg: 'red', color: 'white', borderRadius: 2 }}>
          <Text>Error: {error.message}</Text>
        </Box>
      )}

      {data && (
        <Box sx={{ mt: 3 }}>
          <Heading as="h2" sx={{ mb: 2 }}>
            Search Results
          </Heading>
          <Box sx={{ p: 3, bg: 'muted', borderRadius: 2 }}>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </Box>
        </Box>
      )}
    </div>
  )
}

export default PanFinderPage
