import type { ArrayField } from 'payload/dist/fields/config/types'
import type { Field } from 'payload/types'

import deepMerge from '../utilities/deepMerge'
import type { LinkAppearances } from './link'
import link from './link'

type LinkGroupType = (options?: {
  overrides?: Partial<ArrayField>
  appearances?: LinkAppearances[] | false
  name?: string | 'links'
  label?: string | 'Links'
}) => Field

const linkGroup: LinkGroupType = ({ overrides = {}, appearances, name = 'links', label = 'Links' } = {}) => {
  const generatedLinkGroup: Field = {
    name,
    label,
    type: 'array',
    fields: [
      link({
        appearances,
      }),
    ],
  }

  return deepMerge(generatedLinkGroup, overrides)
}

export default linkGroup
