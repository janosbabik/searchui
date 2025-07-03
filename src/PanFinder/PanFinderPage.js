import { Textarea } from '@rebass/forms'
import React, { useState } from 'react'
import { FiSearch } from 'react-icons/fi'

import { usePanFinderApi } from '../Api/usePanFinderApi'
import Spinner from '../App/Spinner'
import { Heading, Flex, Button, Box, Text } from '../Primitives'

function getScoreBackgroundColor(result, maxScore) {
  const normalizedScore = maxScore > 0 ? result.overall_score / maxScore : 0
  const red = Math.round(255 * (1 - normalizedScore))
  const green = Math.round(180 * normalizedScore)
  return `rgba(${red}, ${green}, 0, 0.3)`
}

function getScoreTextColor(result, maxScore) {
  const normalizedScore = maxScore > 0 ? result.overall_score / maxScore : 0
  return normalizedScore > 0.7 ? '#f7fafc' : '#e2e8f0'
}

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
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      <Heading as="h1" variant="display" sx={{ textAlign: 'center', mb: 3 }}>
        PaN-Finder
      </Heading>
      <Text
        as="p"
        sx={{ textAlign: 'center', mb: 4, color: 'muted', fontSize: 2 }}
      >
        Search through scientific datasets and research publications
      </Text>
      <Box as="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Box sx={{ width: '100%', position: 'relative', mb: 3 }}>
          <Textarea
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter search text... (e.g., 'datasets where publisher is ESS')"
            sx={{
              width: '100%',
              height: '120px',
              fontSize: 'large',
              resize: 'vertical',
              paddingRight: '50px',
              border: '1px solid #646eb1',
            }}
          />
          <Button
            aria-label="Search"
            type="submit"
            disabled={isLoading}
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
          <Text as="p" sx={{ mb: 3, fontWeight: 'medium', fontSize: 1 }}>
            Try these example queries:
          </Text>
          <Flex sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
            {[
              'Look for datasets where the publisher is ESS.',
              "Look for datasets where the publisher is MAX IV and the beam's shape is ellipse and slit vertical is 0.05.",
              'Document where the DOI is 10.15151/ESRF-ES-1317814821.',
              'Find datasets from the Munich Crystallography BAG experiment conducted at the ID23-1 instrument between March 12 and July 27, 2018, where the resolution is less than 2.1 and the number of images is 2.',
              'Look for research proposals involving the D50 T tomograph where the sample formula includes Si, O, K, Al, Na and the publication year is 2018.',
              'Look for studies on solid polarizers for cold neutrons where the experimental energy is less than -19 A and the publication year is 2016 or 2017.',
              'Look for research on magnetic diffuse scattering in CuMnO2 where the temperature is between 1.5 K and 300 K and the sample mass is 10,000.',
              'Look for research about Crystal structure where the publication year is 2025.',
            ].map((query) => (
              <Button
                key={query}
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
                }}
              >
                {query.length > 60 ? `${query.slice(0, 60)}...` : query}
              </Button>
            ))}
          </Flex>
        </Box>
      </Box>

      {isLoading && <Spinner />}

      {error && !isLoading && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            bg: 'red',
            color: 'white',
            borderRadius: '8px',
            border: '1px solid #e53e3e',
          }}
        >
          <Text sx={{ fontWeight: 'medium' }}>⚠️ Error: {error.message}</Text>
        </Box>
      )}

      {data && !isLoading && (
        <Box sx={{ mt: 4 }}>
          <Flex
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            <Heading as="h2" sx={{ m: 0 }}>
              Search Results
            </Heading>
            <Text
              sx={{
                fontSize: 1,
                color: 'muted',
                bg: 'muted',
                px: 2,
                py: 1,
                borderRadius: '12px',
                fontWeight: 'medium',
              }}
            >
              {data.total_results} found
            </Text>
          </Flex>
          {data.results && data.results.length > 0 ? (
            <Box
              sx={{
                overflowX: 'auto',
                border: '1px solid',
                borderColor: '#4a5568',
                borderRadius: '8px',
                bg: '#2d3748',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '2px solid #4a5568',
                      backgroundColor: '#1a202c',
                    }}
                  >
                    <th
                      style={{
                        padding: '12px 8px',
                        textAlign: 'left',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#e2e8f0',
                      }}
                    >
                      DOI
                    </th>
                    <th
                      style={{
                        padding: '12px 8px',
                        textAlign: 'left',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#e2e8f0',
                      }}
                    >
                      Title
                    </th>
                    <th
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#e2e8f0',
                      }}
                    >
                      Overall
                    </th>
                    <th
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#e2e8f0',
                      }}
                    >
                      Similarity
                    </th>
                    <th
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#e2e8f0',
                      }}
                    >
                      Chunk Sim.
                    </th>
                    <th
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#e2e8f0',
                      }}
                    >
                      Full Match
                    </th>
                    <th
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#e2e8f0',
                      }}
                    >
                      Partial Match
                    </th>
                    <th
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#e2e8f0',
                      }}
                    >
                      Keywords
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((result, index) => {
                    const maxScore = Math.max(
                      ...data.results.map((r) => r.overall_score || 0),
                    )
                    return (
                      <tr
                        key={result.doi}
                        style={{
                          borderBottom: '1px solid #4a5568',
                          backgroundColor:
                            index % 2 === 0 ? '#2d3748' : '#374151',
                        }}
                      >
                        <td
                          style={{
                            padding: '12px 8px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={result.doi}
                        >
                          <a
                            href={`https://doi.org/${result.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#63b3ed',
                              textDecoration: 'none',
                              fontWeight: '500',
                            }}
                            onMouseOver={(e) => {
                              e.target.style.textDecoration = 'underline'
                            }}
                            onMouseOut={(e) => {
                              e.target.style.textDecoration = 'none'
                            }}
                            onFocus={(e) => {
                              e.target.style.textDecoration = 'underline'
                            }}
                            onBlur={(e) => {
                              e.target.style.textDecoration = 'none'
                            }}
                          >
                            {result.doi}
                          </a>
                        </td>
                        <td style={{ padding: '12px 8px', maxWidth: '300px' }}>
                          <Text
                            sx={{
                              fontWeight: 'medium',
                              lineHeight: 1.4,
                              fontSize: '13px',
                              color: '#e2e8f0',
                            }}
                          >
                            {result.title}
                          </Text>
                        </td>
                        <td
                          style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            backgroundColor: getScoreBackgroundColor(
                              result,
                              maxScore,
                            ),
                            fontWeight: '600',
                            borderRadius: '4px',
                          }}
                        >
                          <Text
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '13px',
                              color: getScoreTextColor(result, maxScore),
                            }}
                          >
                            {result.overall_score.toFixed(3)}
                          </Text>
                        </td>
                        <td
                          style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#cbd5e0',
                          }}
                        >
                          {result.similarity_score.toFixed(3)}
                        </td>
                        <td
                          style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#cbd5e0',
                          }}
                        >
                          {result.chunk_similarity_score.toFixed(3)}
                        </td>
                        <td
                          style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#cbd5e0',
                          }}
                        >
                          <span style={{ marginRight: '4px' }}>
                            {result.full_match_score.toFixed(3)}
                          </span>
                          <span
                            style={{
                              color:
                                result.full_match_score > 0
                                  ? '#68d391'
                                  : '#fc8181',
                            }}
                          >
                            {result.full_match_score > 0 ? '✓' : '✗'}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#cbd5e0',
                          }}
                        >
                          {result.partial_match_score.toFixed(3)}
                        </td>
                        <td
                          style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#cbd5e0',
                          }}
                        >
                          {result.keyword_score.toFixed(3)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Box>
          ) : (
            <Box
              sx={{
                p: 4,
                bg: 'muted',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'muted',
              }}
            >
              <Text sx={{ fontStyle: 'italic', color: 'muted', fontSize: 2 }}>
                🔍 No results found for your search query.
              </Text>
              <Text sx={{ mt: 2, fontSize: 1, color: 'muted' }}>
                Try different keywords or check the example queries above.
              </Text>
            </Box>
          )}

          {/* Show query details in a collapsible section */}
          <Box
            sx={{
              mt: 4,
              p: 3,
              bg: 'muted',
              borderRadius: '8px',
              border: '1px solid #4a5568',
            }}
          >
            <details>
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  padding: '4px 0',
                }}
              >
                Query Details
              </summary>
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'muted',
                }}
              >
                <Text sx={{ mb: 2 }}>
                  <strong>Original Query:</strong> {data.original_query}
                </Text>
                {data.structured_query && (
                  <Box sx={{ mt: 2 }}>
                    <Text sx={{ mb: 2 }}>
                      <strong>Structured Query:</strong>
                    </Text>
                    <Box
                      sx={{
                        bg: 'background',
                        p: 2,
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: 'muted',
                        overflow: 'auto',
                      }}
                    >
                      <pre
                        style={{
                          fontSize: '12px',
                          margin: 0,
                          fontFamily: 'monospace',
                        }}
                      >
                        {JSON.stringify(data.structured_query, null, 2)}
                      </pre>
                    </Box>
                  </Box>
                )}
              </Box>
            </details>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default PanFinderPage
