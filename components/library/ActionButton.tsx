import { ExtendedActionData } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { Button, ButtonLinkProps, ButtonVariant } from './Button.tsx'
import { ComponentChildren } from 'preact/src/index.d.ts'

function actionButtonProps(
  action: Omit<ExtendedActionData, 'text'>,
): ButtonLinkProps & {
  disabled?: boolean
} {
  const { disabled, method, href } = action
  if (disabled) {
    return {
      disabled,
    }
  }

  assert(href)
  if (method === 'POST') {
    return {
      method,
      action: href,
      type: 'submit',
    }
  }
  return {
    href,
  }
}

export function ActionButton(
  { action, children, variant = 'ghost' }: {
    action: Partial<ExtendedActionData>
    children?: ComponentChildren
    variant?: ButtonVariant
  },
) {
  const props = actionButtonProps(action)
  if (action.text) {
    assert(!children, 'children and action.text are mutually exclusive')
    children = action.text
  } else {
    assert(children, 'must specify children or action.text')
  }
  return (
    <Button
      {...props}
      variant={variant}
      className='text-indigo-700 hover:text-indigo-900 capitalize justify-start'
    >
      {children}
    </Button>
  )
}
