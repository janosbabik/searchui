import { Textarea } from '@rebass/forms'
import React from 'react'
import { FiSearch } from 'react-icons/fi'

import { Box, Button, Flex, Text } from '../../Primitives'

const exampleQueries = [
  'Look for datasets where the publisher is ESS.',
  "Look for datasets where the publisher is MAX IV and the beam's shape is ellipse and slit vertical is 0.05.",
  'Document where the DOI is 10.15151/ESRF-ES-1317814821.',
  'Find datasets from the Munich Crystallography BAG experiment conducted at the ID23-1 instrument between March 12 and July 27, 2018, where the resolution is less than 2.1 and the number of images is 2.',
  'Look for research proposals involving the D50 T tomograph where the sample formula includes Si, O, K, Al, Na and the publication year is 2018.',
  'Look for studies on solid polarizers for cold neutrons where the experimental energy is less than -19 A and the publication year is 2016 or 2017.',
  'Look for research on magnetic diffuse scattering in CuMnO2 where the temperature is between 1.5 K and 300 K and the sample mass is 10,000.',
  'Look for research about Crystal structure where the publication year is 2025.',
]

function SearchForm({
  inputValue,
  handleInputChange,
  handleKeyDown,
  handleSubmit,
  isLoading,
  setInputValue,
  disabled = false,
}) {
  return (
    <Box as="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <Box sx={{ width: '100%', position: 'relative', mb: 3 }}>
        <Textarea
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter search text... (e.g., 'datasets where publisher is ESS')"
          disabled={disabled}
          sx={{
            width: '100%',
            height: '120px',
            fontSize: 'large',
            resize: 'vertical',
            paddingRight: '50px',
            border: '1px solid #646eb1',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        <Button
          aria-label="Search"
          type="submit"
          disabled={isLoading || disabled}
          sx={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            minWidth: 'auto',
            padding: '8px',
            '&:disabled': {
              opacity: 0.6,
              cursor: 'not-allowed',
            },
          }}
        >
          <FiSearch size={18} />
        </Button>
      </Box>

      {/* Example queries */}
      <Box sx={{ textAlign: 'center' }}>
        <Text
          as="p"
          sx={{
            mb: 3,
            fontWeight: 'medium',
            fontSize: 1,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          Try these example queries:
        </Text>
        <Flex sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
          {exampleQueries.map((query) => (
            <Button
              key={query}
              disabled={isLoading || disabled}
              onClick={() => setInputValue(query)}
              variant="outline"
              sx={{
                fontSize: 0,
                padding: '8px 12px',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: '#4a5568',
                bg: 'background',
                color: 'text',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                '&:hover': {
                  bg: '#4a5568',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed',
                },
              }}
            >
              {query.length > 60 ? `${query.slice(0, 60)}...` : query}
            </Button>
          ))}
        </Flex>
      </Box>
    </Box>
  )
}

export default SearchForm
