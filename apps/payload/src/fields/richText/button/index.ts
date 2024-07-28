import type { RichTextCustomElement } from '@payloadcms/richtext-slate/dist/types'

import Button from './Button'
import Element from './Element'
import withBtn from './plugin'

const richTextButton: RichTextCustomElement = {
  name: 'rich-text-btn',
  Button,
  Element,
  plugins: [withBtn],
}

export default richTextButton
