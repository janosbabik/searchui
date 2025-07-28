import { Textarea } from '@rebass/forms'
import React, { useState } from 'react'
import { FiSearch, FiChevronDown, FiChevronRight } from 'react-icons/fi'

import { usePanFinderApi } from '../Api/usePanFinderApi'
import { Heading, Flex, Button, Box, Text } from '../Primitives'

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

function getScoreBackgroundColor(result, maxScore) {
  const normalizedScore = maxScore > 0 ? result.overall_score / maxScore : 0
  const red = Math.round(120 * (1 - normalizedScore))
  const green = Math.round(100 * normalizedScore)
  return `rgb(${red}, ${green}, 0)`
}

function getScoreTextColor(result, maxScore) {
  const normalizedScore = maxScore > 0 ? result.overall_score / maxScore : 0
  return normalizedScore > 0.7 ? '#d2d9e1ff' : '#b6bfcaff'
}

function DocumentDetails({ details, isLoading, doi }) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan="4" style={{ padding: '16px', textAlign: 'center' }}>
          <Flex sx={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Box
              sx={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTop: '2px solid #48bb78',
                borderRight: '2px solid #48bb78',
                backgroundColor: 'transparent',
                flexShrink: 0,
                animation: 'spin 1s linear infinite',
              }}
            />
            <Text sx={{ color: '#a0aec0', fontSize: '13px' }}>
              Loading document details...
            </Text>
          </Flex>
        </td>
      </tr>
    )
  }

  if (details?.error) {
    return (
      <tr>
        <td colSpan="4" style={{ padding: '16px' }}>
          <Box sx={{ bg: '#742a2a', p: 3, borderRadius: '4px' }}>
            <Text sx={{ color: '#fed7d7', fontSize: '13px' }}>
              Error loading details: {details.error}
            </Text>
          </Box>
        </td>
      </tr>
    )
  }

  if (!details) {
    return null
  }

  return (
    <tr>
      <td colSpan="4" style={{ padding: 0, backgroundColor: '#1a202c' }}>
        <Box sx={{ p: 4, borderTop: '1px solid #4a5568' }}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* DOI */}
            <Box>
              <Text
                sx={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#a0aec0',
                  mb: 1,
                }}
              >
                DOI
              </Text>
              <Text
                sx={{
                  fontSize: '13px',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                }}
              >
                <a
                  href={`https://doi.org/${details.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#63b3ed',
                    textDecoration: 'none',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.textDecoration = 'underline'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.textDecoration = 'none'
                  }}
                >
                  {details.doi}
                </a>
              </Text>
            </Box>

            {/* Title */}
            <Box>
              <Text
                sx={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#a0aec0',
                  mb: 1,
                }}
              >
                Title
              </Text>
              <Text
                sx={{
                  fontSize: '13px',
                  color: '#e2e8f0',
                  lineHeight: 1.4,
                  fontWeight: 'medium',
                }}
              >
                {details.title}
              </Text>
            </Box>

            {/* Facility */}
            {details.facility_name && (
              <Box>
                <Text
                  sx={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#a0aec0',
                    mb: 1,
                  }}
                >
                  Facility
                </Text>
                <Text sx={{ fontSize: '13px', color: '#e2e8f0' }}>
                  {details.facility_name}
                </Text>
              </Box>
            )}

            {/* Summary */}
            {details.summary && (
              <Box>
                <Text
                  sx={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#a0aec0',
                    mb: 1,
                  }}
                >
                  Summary
                </Text>
                <Box
                  sx={{
                    bg: '#2d3748',
                    p: 2,
                    borderRadius: '2px',
                    border: '1px solid #4a5568',
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}
                >
                  <Text
                    sx={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}
                  >
                    {details.summary}
                  </Text>
                </Box>
              </Box>
            )}

            {/* Text Content */}
            {details.text && (
              <Box>
                <Text
                  sx={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#a0aec0',
                    mb: 1,
                  }}
                >
                  Content
                </Text>
                <Box
                  sx={{
                    bg: '#2d3748',
                    p: 2,
                    borderRadius: '2px',
                    border: '1px solid #4a5568',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  <Text
                    sx={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}
                  >
                    {details.text.length > 500
                      ? `${details.text.substring(0, 500)}...`
                      : details.text}
                  </Text>
                </Box>
              </Box>
            )}

            {/* Raw Data */}
            {details.raw && (
              <Box>
                <Text
                  sx={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#a0aec0',
                    mb: 1,
                  }}
                >
                  Raw Data
                </Text>
                <Box
                  sx={{
                    bg: '#111827',
                    p: 2,
                    borderRadius: '4px',
                    border: '1px solid #4a5568',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  <pre
                    style={{
                      fontSize: '11px',
                      color: '#d1d5db',
                      margin: 0,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {typeof details.raw === 'object'
                      ? JSON.stringify(details.raw, null, 2)
                      : details.raw}
                  </pre>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </td>
    </tr>
  )
}

function ResultTableRow({
  result,
  index,
  maxScore,
  onRowClick,
  isExpanded,
  documentDetails,
  isLoadingDetails,
}) {
  return (
    <>
      <tr
        key={result.doi || index}
        onClick={() => onRowClick(result.doi)}
        style={{
          borderBottom: '1px solid #4a5568',
          backgroundColor: index % 2 === 0 ? '#2d3748' : '#374151',
          opacity: 0,
          animation: 'fadeInUp 0.2s ease-out forwards',
          animationDelay: `${0.2 + index * 0.02}s`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#4a5568'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor =
            index % 2 === 0 ? '#2d3748' : '#374151'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <td
          style={{
            padding: '12px 8px',
            textAlign: 'center',
            width: '40px',
          }}
        >
          {isExpanded ? (
            <FiChevronDown size={16} style={{ color: '#a0aec0' }} />
          ) : (
            <FiChevronRight size={16} style={{ color: '#a0aec0' }} />
          )}
        </td>
        <td
          style={{
            padding: '12px 8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            maxWidth: '120px',
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
            onClick={(e) => e.stopPropagation()} // Prevent row click when clicking link
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
            backgroundColor: getScoreBackgroundColor(result, maxScore),
            fontWeight: '600',
          }}
        >
          <Text
            sx={{
              fontWeight: 'normal',
              fontSize: '13px',
              color: getScoreTextColor(result, maxScore),
            }}
          >
            {(result.overall_score || 0).toFixed(3)}
          </Text>
        </td>
      </tr>
      {isExpanded && (
        <DocumentDetails
          details={documentDetails}
          isLoading={isLoadingDetails}
          doi={result.doi}
        />
      )}
    </>
  )
}

function PanFinderPage() {
  const [inputValue, setInputValue] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [documentDetails, setDocumentDetails] = useState({})
  const [loadingDetails, setLoadingDetails] = useState(new Set())
  const {
    data,
    error,
    isLoading,
    streamingSteps,
    search,
    fetchDocumentDetails,
  } = usePanFinderApi()

  const handleRowExpand = async (doi) => {
    const newExpandedRows = new Set(expandedRows)

    if (expandedRows.has(doi)) {
      // Collapse the row
      newExpandedRows.delete(doi)
      setExpandedRows(newExpandedRows)
    } else {
      // Expand the row
      newExpandedRows.add(doi)
      setExpandedRows(newExpandedRows)

      // Fetch document details if not already loaded
      if (!documentDetails[doi]) {
        const newLoadingDetails = new Set(loadingDetails)
        newLoadingDetails.add(doi)
        setLoadingDetails(newLoadingDetails)

        try {
          const details = await fetchDocumentDetails(doi)
          setDocumentDetails((prev) => ({ ...prev, [doi]: details }))
        } catch (err) {
          console.error('Failed to fetch document details:', err)
          setDocumentDetails((prev) => ({
            ...prev,
            [doi]: { error: err.message },
          }))
        } finally {
          const newLoadingDetailsAfter = new Set(loadingDetails)
          newLoadingDetailsAfter.delete(doi)
          setLoadingDetails(newLoadingDetailsAfter)
        }
      }
    }
  }

  const handleSearch = () => {
    if (inputValue.trim()) {
      search(inputValue.trim())
    }
  }

  function handleSubmit(evt) {
    evt.preventDefault()
    handleSearch()
  }

  function handleInputChange(evt) {
    setInputValue(evt.target.value)
  }

  function handleKeyDown(evt) {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault()
      handleSearch()
    }
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
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
      <Box as="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Box sx={{ width: '100%', position: 'relative', mb: 3 }}>
          <Textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
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
            {exampleQueries.map((query) => (
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

      {/* Streaming Steps Display - Show loading steps or streaming events */}
      {(isLoading || streamingSteps.length > 0) && !data && (
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
                    {step.event === 'analysis_started' &&
                      'Analysing your query...'}
                    {step.event === 'analysis_completed' && 'Analysis complete'}
                    {step.event === 'database_query_started' &&
                      'Fetching data...'}
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
      )}

      {error && !isLoading && (
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
      )}

      {data && (
        <Box
          sx={{
            mt: 4,
            opacity: 0,
            animation: 'fadeInUp 0.3s ease-out forwards',
          }}
        >
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
                fontSize: 0,
                color: '#a0aec0',
                fontStyle: 'italic',
                ml: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <FiChevronRight size={12} />
              Click rows to view details
            </Text>
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
              {data.total_results || 0} found
            </Text>
          </Flex>
          {data.results &&
          Array.isArray(data.results) &&
          data.results.length > 0 ? (
            <Box
              sx={{
                overflowX: 'auto',
                border: '1px solid',
                borderColor: '#4a5568',
                borderRadius: '3px',
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
                      borderBottom: '1px solid #4a5568',
                      backgroundColor: '#1a202c',
                    }}
                  >
                    <th
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#e2e8f0',
                        width: '40px',
                      }}
                    >
                      {/* Expand/Collapse column */}
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
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((result, index) => {
                    const maxScore = Math.max(
                      ...data.results.map((r) => r.overall_score || 0),
                    )
                    return (
                      <ResultTableRow
                        key={result.doi || index}
                        result={result}
                        index={index}
                        maxScore={maxScore}
                        onRowClick={handleRowExpand}
                        isExpanded={expandedRows.has(result.doi)}
                        documentDetails={documentDetails[result.doi]}
                        isLoadingDetails={loadingDetails.has(result.doi)}
                      />
                    )
                  })}
                </tbody>
              </table>
            </Box>
          ) : (
            <Box
              sx={{
                p: [4, 5],
                bg: 'background',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'secondary',
                position: 'relative',
                overflow: 'hidden',
                opacity: 0,
                animation: 'fadeInUp 0.3s ease-out forwards',
                animationDelay: '0.15s',
                ':before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(135deg, rgba(36, 114, 179, 0.05) 0%, rgba(100, 110, 177, 0.05) 50%, rgba(187, 70, 119, 0.05) 100%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Text
                  sx={{
                    fontWeight: 'semibold',
                    color: 'text',
                    fontSize: [2, 3],
                    mb: 2,
                    lineHeight: 1.3,
                  }}
                >
                  No results found for your search
                </Text>
                <Text
                  sx={{
                    fontSize: [1, 2],
                    color: 'text',
                    opacity: 0.7,
                    lineHeight: 1.5,
                  }}
                >
                  Try different keywords or check the example queries above
                </Text>
              </Box>
            </Box>
          )}

          {/* Show query details in a collapsible section */}
          <Box
            sx={{
              mt: 4,
              bg: '#1a202c',
              borderRadius: '3px',
              border: '1px solid #2d3748',
              overflow: 'hidden',
              opacity: 0,
              animation: 'fadeInUp 0.2s ease-out forwards',
              animationDelay: '0.3s',
            }}
          >
            <details>
              <summary
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  color: '#a0aec0',
                  backgroundColor: '#2d3748',
                  borderBottom: '1px solid #374151',
                  userSelect: 'none',
                  outline: 'none',
                }}
              >
                Query Details
              </summary>
              <Box
                sx={{
                  p: 3,
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Text
                    sx={{
                      mb: 2,
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#718096',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Original Query
                  </Text>{' '}
                  <Box
                    sx={{
                      bg: '#111827',
                      p: 2,
                      borderRadius: '4px',
                      border: '1px solid #374151',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: '#d1d5db',
                      wordBreak: 'break-word',
                    }}
                  >
                    {data.original_query || 'No query available'}
                  </Box>
                </Box>
                {data.structured_query && (
                  <Box>
                    <Text
                      sx={{
                        mb: 2,
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#718096',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Structured Query
                    </Text>
                    <Box
                      sx={{
                        bg: '#111827',
                        p: 2,
                        borderRadius: '4px',
                        border: '1px solid #374151',
                        overflow: 'auto',
                      }}
                    >
                      <pre
                        style={{
                          fontSize: '12px',
                          margin: 0,
                          fontFamily: 'monospace',
                          color: '#d1d5db',
                          lineHeight: 1.4,
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
