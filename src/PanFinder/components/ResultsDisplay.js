import React from 'react'
import { FiChevronRight } from 'react-icons/fi'

import { Box, Flex, Heading, Text } from '../../Primitives'
import ResultTableRow from './ResultTableRow'

function ResultsDisplay({
  data,
  expandedRows,
  documentDetails,
  loadingDetails,
  handleRowExpand,
}) {
  if (!data) {
    return null
  }

  return (
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
                    width: '10px',
                  }}
                >
                  {/* Empty column for spacing */}
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
    </Box>
  )
}

export default ResultsDisplay
