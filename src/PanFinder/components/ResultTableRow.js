import React from 'react'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

import { Text } from '../../Primitives'
import DocumentDetails from './DocumentDetails'

export function getScoreBackgroundColor({ overall_score: overallScore }) {
  const red = Math.round(120 * (1 - overallScore))
  const green = Math.round(100 * overallScore)
  return `rgb(${red}, ${green}, 0)`
}

function getRelevanceDisplay(resultType) {
  if (resultType === 'relevant') {
    return {
      label: 'High',
      color: '#48bb78',
      bgColor: '#1a2e1a',
      borderColor: '#48bb78',
    }
  } else if (resultType === 'weakly_relevant') {
    return {
      label: 'Low',
      color: '#f6ad55',
      bgColor: '#2d2014',
      borderColor: '#f6ad55',
    }
  }
  return {
    label: 'Unknown',
    color: '#a0aec0',
    bgColor: '#2d3748',
    borderColor: '#a0aec0',
  }
}

function ResultTableRow({
  result,
  index,
  onRowClick,
  isExpanded,
  documentDetails,
  isLoadingDetails,
  resultType,
}) {
  const relevanceInfo = getRelevanceDisplay(resultType)

  // Adjust row colors based on relevance
  const baseRowColor =
    resultType === 'relevant'
      ? index % 2 === 0
        ? '#2d3748'
        : '#374151'
      : index % 2 === 0
      ? '#2a2e35'
      : '#31363d'
  const hoverRowColor = resultType === 'relevant' ? '#4a5568' : '#3a3f46'

  return (
    <>
      <tr
        key={result.doi || index}
        onClick={() => onRowClick(result.doi)}
        style={{
          backgroundColor: baseRowColor,
          opacity: 0,
          animation: 'fadeInUp 0.2s ease-out forwards',
          animationDelay: `${index * 0.02}s`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = hoverRowColor
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = baseRowColor
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
            maxWidth: '200px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#ced3daff',
          }}
        >
          {result.facility_name}
        </td>
        <td
          style={{
            padding: '12px 8px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '4px 8px',
              borderRadius: '12px',
              border: `1px solid ${relevanceInfo.borderColor}`,
              backgroundColor: relevanceInfo.bgColor,
              color: relevanceInfo.color,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {relevanceInfo.label}
          </span>
        </td>
        <td
          style={{
            textAlign: 'center',
            backgroundColor: getScoreBackgroundColor(result),
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
