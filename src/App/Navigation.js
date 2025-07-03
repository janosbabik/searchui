import { Input } from '@rebass/forms/styled-components'
import { FiSearch } from 'react-icons/fi'
import { Redirect, Route, useLocation } from 'react-router-dom'

import { Box, Button, Flex, Image, NavLink } from '../Primitives'
import logo from '../logo.svg'
import { useQueryParam } from '../router-utils'
import ResultsCount from './ResultsCount'

function Navigation() {
  const location = useLocation()
  const { value: query, setValue: setQuery } = useQueryParam('q')

  function handleSubmit(evt) {
    evt.preventDefault()
    const param = new URLSearchParams(new FormData(evt.target))
    const newQuery = param.get('q').trim()
    if (newQuery !== '') {
      setQuery(newQuery)
    }
  }

  return (
    <Flex
      as="nav"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        height: 'navHeight',
        mb: [3, 4],
        px: [1, 1, 3, 4],
        bg: 'bgNav',
      }}
    >
      <NavLink to="/" exact>
        <Box height="logoHeight" p={[1, 0]}>
          <Image height="100%" width="unset" alt="PaNOSC logo" src={logo} />
        </Box>
      </NavLink>

      <NavLink to="/pan-finder" sx={{ alignSelf: 'center', mx: 3 }}>
        PaN-Finder
      </NavLink>

      <Route path="/search">
        {!query?.trim() && <Redirect to="/" />}
        <Flex
          as="form"
          sx={{ flex: '1 1 0%', alignItems: 'center', px: 3 }}
          onSubmit={handleSubmit}
        >
          <Flex sx={{ flex: '1 1 0%', maxWidth: '30rem' }}>
            <Input key={location.search} name="q" defaultValue={query} mr={2} />
            <Button aria-label="Search" type="submit">
              <FiSearch />
            </Button>
          </Flex>
          <Box sx={{ display: ['none', 'none', 'inline'], pl: 3 }}>
            <ResultsCount />
          </Box>
        </Flex>
      </Route>
    </Flex>
  )
}

export default Navigation
