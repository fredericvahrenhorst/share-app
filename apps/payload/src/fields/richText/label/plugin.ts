import type { RichTextCustomElement } from '@payloadcms/richtext-slate/dist/types'
import type { BaseEditor } from 'slate'

const withLabel: any = incomingEditor => {
  const editor: BaseEditor & {
    shouldBreakOutOnEnter?: (element: any) => boolean // eslint-disable-line @typescript-eslint/no-explicit-any
  } = incomingEditor

  const { shouldBreakOutOnEnter } = editor

  if (shouldBreakOutOnEnter) {
    editor.shouldBreakOutOnEnter = element =>
      element.type === 'label' ? true : shouldBreakOutOnEnter(element)
  }

  return editor
}

export default withLabel