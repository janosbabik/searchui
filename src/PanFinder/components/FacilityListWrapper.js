import React from 'react'

import { Box, Heading } from '../../Primitives'
import FacilityList from '../../Home/Facilites'

/**
 * FacilityListWrapper - A wrapper component that displays a title and facility list
 * with centered styling and no list bullet points
 */
function FacilityListWrapper({
  only = ['ESS', 'ESRF', 'ILL', 'PSI', 'MAXIV'],
}) {
  return (
    <Box
      sx={{
        mt: 5,
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: '0.875rem',
        '& ul': {
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        },
        '& li': {
          textAlign: 'center',
        },
      }}
    >
      <Heading
        sx={{
          mb: 2,
          textAlign: 'center',
          fontSize: '1.25rem',
        }}
      >
        Open Data from facilities
      </Heading>
      <FacilityList only={only} />
    </Box>
  )
}

export default FacilityListWrapper
