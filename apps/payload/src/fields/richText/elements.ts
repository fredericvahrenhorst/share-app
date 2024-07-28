import type { RichTextElement } from '@payloadcms/richtext-slate/dist/types'

import label from './label'
import button from './button'

const elements: RichTextElement[] = [
  'h2',
  'h3',
  'h4',
  'link',
  'ol',
  'ul',
  label,
  button,
]

export default elements
