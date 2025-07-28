import React, { useState } from 'react'
import { FiEdit3, FiSave, FiX } from 'react-icons/fi'

import { Box, Text, Button, Flex } from '../../Primitives'

function QueryDetails({ data, onStructuredSearch }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState('')

  if (!data) {
    return null
  }

  const handleEditStart = () => {
    setEditedData(JSON.stringify(data.raw_structured_data, null, 2))
    setIsEditing(true)
  }

  const handleSave = () => {
    try {
      const parsedData = JSON.parse(editedData)
      onStructuredSearch(parsedData, data.original_query)
      setIsEditing(false)
    } catch (error) {
      alert('Invalid JSON format. Please check your syntax.')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData('')
  }

  return (
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
            </Text>
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
          {data.raw_structured_data && (
            <Box>
              <Flex
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Text
                  sx={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#718096',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Structured Data
                </Text>
                {!isEditing ? (
                  <Button
                    variant="action"
                    onClick={handleEditStart}
                    sx={{
                      p: 1,
                      ml: 0,
                      fontSize: '12px',
                      color: '#a0aec0',
                      ':hover': {
                        color: '#e2e8f0',
                      },
                    }}
                    title="Edit structured data"
                  >
                    <FiEdit3 size={14} />
                  </Button>
                ) : (
                  <Flex sx={{ gap: 1 }}>
                    <Button
                      variant="action"
                      onClick={handleSave}
                      sx={{
                        p: 1,
                        ml: 0,
                        fontSize: '12px',
                        color: '#48bb78',
                        ':hover': {
                          color: '#68d391',
                        },
                      }}
                      title="Save and search"
                    >
                      <FiSave size={14} />
                    </Button>
                    <Button
                      variant="action"
                      onClick={handleCancel}
                      sx={{
                        p: 1,
                        ml: 0,
                        fontSize: '12px',
                        color: '#f56565',
                        ':hover': {
                          color: '#fc8181',
                        },
                      }}
                      title="Cancel"
                    >
                      <FiX size={14} />
                    </Button>
                  </Flex>
                )}
              </Flex>
              <Box
                sx={{
                  bg: '#111827',
                  p: 2,
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  overflow: 'auto',
                }}
              >
                {isEditing ? (
                  <textarea
                    value={editedData}
                    onChange={(e) => setEditedData(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: '#d1d5db',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                ) : (
                  <pre
                    style={{
                      fontSize: '12px',
                      margin: 0,
                      fontFamily: 'monospace',
                      color: '#d1d5db',
                      lineHeight: 1.4,
                    }}
                  >
                    {JSON.stringify(data.raw_structured_data, null, 2)}
                  </pre>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </details>
    </Box>
  )
}

export default QueryDetails
