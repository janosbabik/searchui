import useSWRImmutable from 'swr/immutable'

import { Link } from '../Primitives'
import providers from '../providers.json'

/**
 * FacilityList - Displays a list of facility providers
 *
 * @param {Object} props
 * @param {string[]} [props.only] - Optional array of provider abbreviations to show.
 *                                 If provided, only providers with matching abbr will be displayed.
 *                                 If not provided, all available providers will be shown.
 *
 * @example
 * // Show all available providers
 * <FacilityList />
 *
 * @example
 * // Show only specific providers by abbreviation
 * <FacilityList only={['ESS', 'ESRF']} />
 */
function FacilityList({ only }) {
  const [infoUrl] = process.env.REACT_APP_API.split('/api')
  const { data } = useSWRImmutable(infoUrl)

  return (
    <ul>
      {providers
        .filter((source) => data.data_providers.includes(source.url))
        .filter((source) => !only || only.includes(source.abbr))
        .map((source) => (
          <li key={source.name}>
            <Link href={source.homepage} blank>
              {source.name}
            </Link>
          </li>
        ))}
    </ul>
  )
}

export default FacilityList
