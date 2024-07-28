/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line no-use-before-define
import React from 'react'
import ElementButton from '@payloadcms/richtext-slate/dist/field/elements/Button'

const baseClass = 'rich-text-btn-button'

const ToolbarButton: React.FC<{ path: string }> = () => (
  <ElementButton className={baseClass} format="rich-text-btn">
    BUTTON
  </ElementButton>
)

export default ToolbarButton
