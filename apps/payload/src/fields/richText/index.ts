import { slateEditor } from '@payloadcms/richtext-slate'
import type {
  AdapterArguments,
  RichTextElement,
  RichTextLeaf,
} from '@payloadcms/richtext-slate/dist/types'
import type { RichTextField } from 'payload/dist/fields/config/types'

import deepMerge from '../../utilities/deepMerge'
import link from '../link'
import elements from './elements'
import leaves from './leaves'

type RichText = (
  overrides?: Partial<RichTextField> & { admin?: AdapterArguments['admin'] },
  additions?: {
    elements?: RichTextElement[]
    leaves?: RichTextLeaf[]
  },
) => RichTextField

const richText: RichText = (
  overrides,
  additions = {
    elements: [],
    leaves: [],
  },
) => {
  const slateOptions = deepMerge<AdapterArguments['admin'], AdapterArguments['admin']>(
    overrides?.admin || {},
    {
      elements: [...elements, ...(additions.elements || [])],
      leaves: [...leaves, ...(additions.leaves || [])],
    },
  )

  const fieldOverrides = {
    ...(overrides || {}),
  }

  delete fieldOverrides.admin

  return deepMerge<RichTextField, Partial<RichTextField>>(
    {
      name: 'richText',
      type: 'richText',
      required: true,
      editor: slateEditor({
        admin: slateOptions,
      }),
    },
    fieldOverrides || {},
  )
}

export default richText
