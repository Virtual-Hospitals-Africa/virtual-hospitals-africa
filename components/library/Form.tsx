import { JSX } from 'preact'
import cls from '../../util/cls.ts'

export const FormClassName = 'flex flex-col gap-2'

export default function Form(
  { className, ...props }: JSX.FormHTMLAttributes<HTMLFormElement> & {
    className?: string
    method?: string
    action?: string
  },
) {
  return (
    <form
      className={cls(FormClassName, className)}
      {...props}
    />
  )
}
