import { Head } from '$fresh/runtime.ts'
import { ComponentChildren } from 'preact'
import BottomNav from './BottomNav.tsx'
import { Header } from './Header.tsx'
import { Sidebar } from './Sidebar.tsx'
import cls from '../../util/cls.ts'
import SuccessMessage from '../../islands/SuccessMessage.tsx'

export type LayoutProps =
  & {
    title: string
    route: string
    url: URL
    head?: ComponentChildren
    children: ComponentChildren
  }
  & ({
    variant: 'standard' | 'form'
    avatarUrl: string
  } | {
    variant: 'just-logo' | 'landing-page'
    avatarUrl?: undefined
  })

export default function Layout(
  { variant, title, url, children, route, head, avatarUrl }: LayoutProps,
) {
  const success = url.searchParams.get('success')

  return (
    <html className='scroll-smooth bg-white antialiased' lang='en'>
      <Head>
        <title>{title}</title>
        <script
          defer
          src='https://cdnjs.cloudflare.com/ajax/libs/turbolinks/5.2.0/turbolinks.js'
          integrity='sha512-G3jAqT2eM4MMkLMyQR5YBhvN5/Da3IG6kqgYqU9zlIH4+2a+GuMdLb5Kpxy6ItMdCfgaKlo2XFhI0dHtMJjoRw=='
          crossOrigin='anonymous'
          referrerpolicy='no-referrer'
        />
        {head}
      </Head>
      <body className='h-full relative'>
        <SuccessMessage
          message={success}
          className='absolute z-50 top-0 left-0 right-0 m-12'
        />
        {variant === 'landing-page' && children}
        {variant === 'standard' ||
          variant === 'form' && <Sidebar route={route} />}
        {variant !== 'landing-page' && (
          <section
            className={cls(
              variant !== 'just-logo' && 'md:pl-48',
            )}
          >
            <Header
              title={title}
              avatarUrl={avatarUrl}
              variant={variant}
            />
            {children}
          </section>
        )}
        {variant === 'standard' ||
          variant === 'form' && <BottomNav route={route} />}
      </body>
    </html>
  )
}
