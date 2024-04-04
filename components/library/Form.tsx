import { JSX } from 'preact'
import cls from '../../util/cls.ts'

export default function Form(
  { className, ...props }: JSX.HTMLAttributes<HTMLFormElement> & {
    className?: string
  },
) {
  return <form className={cls('flex flex-col gap-2', className)} {...props} />
}
