import React from 'react'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

import { Text } from '../../Primitives'
import DocumentDetails from './DocumentDetails'

export function getScoreBackgroundColor(result, maxScore) {
  const normalizedScore = maxScore > 0 ? result.overall_score / maxScore : 0
  const red = Math.round(120 * (1 - normalizedScore))
  const green = Math.round(100 * normalizedScore)
  return `rgb(${red}, ${green}, 0)`
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
          backgroundColor: index % 2 === 0 ? '#2d3748' : '#374151',
          opacity: 0,
          animation: 'fadeInUp 0.2s ease-out forwards',
          animationDelay: `${index * 0.02}s`,
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
            textAlign: 'center',
            backgroundColor: getScoreBackgroundColor(result, maxScore),
            fontWeight: '600',
          }}
        />
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

export default ResultTableRow
