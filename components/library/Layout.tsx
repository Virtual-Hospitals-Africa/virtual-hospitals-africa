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

export default function Layout(props: LayoutProps) {
  const success = props.url.searchParams.get('success')

  return (
    <html className='scroll-smooth bg-white antialiased' lang='en'>
      <Head>
        <title>{props.title}</title>
        <script
          defer
          src='https://cdnjs.cloudflare.com/ajax/libs/turbolinks/5.2.0/turbolinks.js'
          integrity='sha512-G3jAqT2eM4MMkLMyQR5YBhvN5/Da3IG6kqgYqU9zlIH4+2a+GuMdLb5Kpxy6ItMdCfgaKlo2XFhI0dHtMJjoRw=='
          crossOrigin='anonymous'
          referrerpolicy='no-referrer'
        />
        {props.head}
      </Head>
      <body className='h-full relative'>
        <SuccessMessage
          message={success}
          className='absolute z-50 top-0 left-0 right-0 m-12'
        />
        {props.variant === 'landing-page' ? props.children : (
          <>
            {props.variant !== 'just-logo' && <Sidebar route={props.route} />}
            <section
              className={cls(
                props.variant !== 'just-logo' && 'md:pl-48',
              )}
            >
              <Header
                title={props.title}
                avatarUrl={props.avatarUrl}
                variant={props.variant}
              />
              {props.children}
            </section>
            {props.variant !== 'just-logo' && <BottomNav route={props.route} />}
          </>
        )}
      </body>
    </html>
  )
}
