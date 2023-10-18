import cls from '../../util/cls.ts'

type ArrowLinkProps = {
  href: string
  text: string
  className?: string
}

export default function ArrowLink({ href, text, className }: ArrowLinkProps) {
  return (
    <a
      href={href}
      className={cls(
        'text-base font-bold text-blue-600 hover:text-blue-800 group',
        className,
      )}
    >
      {text}{' '}
      <span aria-hidden='true' className='group-hover:ml-1 transition-all'>
        &rarr;
      </span>
    </a>
  )
}
