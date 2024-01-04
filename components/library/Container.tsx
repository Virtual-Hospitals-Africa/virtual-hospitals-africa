import { JSX } from 'preact'
import cls from '../../util/cls.ts'

const styles = {
  xs: 'mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-2 py-5',
  sm: 'mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:max-w-4xl lg:px-12 py-5',
  md: 'mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:max-w-5xl lg:px-8 py-5',
  lg: 'mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:max-w-7xl lg:px-8 py-5',
  xl: 'mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:max-w-9xl lg:px-8 py-5',
}

type ContainerProps =
  & Omit<JSX.HTMLAttributes<HTMLDivElement>, 'size' | 'className'>
  & {
    size?: keyof typeof styles
    className?: string
  }

export function Container(
  { size = 'sm', className, ...props }: ContainerProps,
) {
  return <div className={cls(styles[size], className)} {...props} />
}
