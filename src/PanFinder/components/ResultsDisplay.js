import React, { useState, useEffect } from 'react'
import { FiChevronRight } from 'react-icons/fi'

import { Box, Flex, Heading, Text } from '../../Primitives'
import ResultTableRow from './ResultTableRow'

function ResultsDisplay({
  data,
  expandedRows,
  documentDetails,
  loadingDetails,
  handleRowExpand,
  hasExplanation,
}) {
  const [showAllResults, setShowAllResults] = useState(false)

  useEffect(() => {
    if (!hasExplanation) {
      setShowAllResults(false)
    }
  }, [hasExplanation])
  if (!data) {
    return null
  }

  // Calculate how many results to show when explanation is present
  const totalResults = data.results?.length || 0
  const maxResultsWhenExplanation = Math.ceil(totalResults / 4)
  const shouldTruncate = hasExplanation && totalResults > 4 && !showAllResults
  const resultsToShow = shouldTruncate
    ? data.results.slice(0, maxResultsWhenExplanation)
    : data.results

  return (
    <Box
      sx={{
        mt: 1,
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
          Documents Found
        </Heading>
        {data.total_results > 0 && (
          <Text
            sx={{
              fontSize: 0,
              color: '#a0aec0',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FiChevronRight size={12} />
            Click rows to view details
          </Text>
        )}
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
            position: 'relative',
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
                    width: '10px',
                  }}
                >
                  {/* Empty column for spacing */}
                </th>
              </tr>
            </thead>
            <tbody>
              {resultsToShow.map((result, index) => (
                <ResultTableRow
                  key={result.doi || index}
                  result={result}
                  index={index}
                  onRowClick={handleRowExpand}
                  isExpanded={expandedRows.has(result.doi)}
                  documentDetails={documentDetails[result.doi]}
                  isLoadingDetails={loadingDetails.has(result.doi)}
                />
              ))}
            </tbody>
          </table>
          {/* Shadow overlay when results are truncated */}
          {shouldTruncate && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60px',
                background:
                  'linear-gradient(to bottom, transparent 0%, rgba(45, 55, 72, 0.8) 50%, rgba(45, 55, 72, 0.95) 100%)',
                pointerEvents: 'none',
                borderBottomLeftRadius: '3px',
                borderBottomRightRadius: '3px',
              }}
            />
          )}
          {/* Show all button */}
          {shouldTruncate && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
              }}
            >
              <Box
                as="button"
                onClick={() => setShowAllResults(true)}
                sx={{
                  background:
                    'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                  color: '#e2e8f0',
                  border: '1px solid #718096',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #718096 0%, #4a5568 100%)',
                    borderColor: '#a0aec0',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                <span>Show all {totalResults} results</span>
                <Box
                  sx={{
                    fontSize: '10px',
                    opacity: 0.8,
                  }}
                >
                  ↓
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            p: [4, 5],
            bg: 'background',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'secondary',
            position: 'relative',
            overflow: 'hidden',
            opacity: 0,
            animation: 'fadeInUp 0.3s ease-out forwards',
            animationDelay: '0.15s',
            ':before': {
              content: '""',
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background:
                'linear-gradient(135deg, rgba(36, 114, 179, 0.1) 0%, rgba(100, 110, 177, 0.1) 50%, rgba(187, 70, 119, 0.1) 100%)',
              borderRadius: '12px',
              pointerEvents: 'none',
              zIndex: -1,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Search Icon */}
            <Box
              sx={{
                width: [48, 64],
                height: [48, 64],
                mx: 'auto',
                mb: 3,
                opacity: 0.6,
                filter: 'drop-shadow(0 4px 8px rgba(36, 114, 179, 0.2))',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ width: '100%', height: '100%' }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <circle cx="11" cy="11" r="3" opacity="0.3" />
              </svg>
            </Box>

            <Text
              sx={{
                fontWeight: 'bold',
                color: 'text',
                fontSize: [3, 4],
                mb: 2,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              No research publications found
            </Text>

            <Text
              sx={{
                fontSize: [2, 2],
                color: 'text',
                opacity: 0.7,
                lineHeight: 1.5,
                mb: 4,
                maxWidth: '400px',
                mx: 'auto',
              }}
            >
              Your search didn't return any matching documents in our scientific
              database
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ResultsDisplay
