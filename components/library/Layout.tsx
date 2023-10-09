import { Head } from '$fresh/runtime.ts'
import { ComponentChildren } from 'preact'
import BottomNav from './BottomNav.tsx'
import { Header } from './Header.tsx'
import { Sidebar } from './Sidebar.tsx'

export type LayoutProps = {
  title: string
  route: string
  avatarUrl: string
  variant: 'standard' | 'form' | 'standard-without-nav'
  children: ComponentChildren
}

export default function Layout(props: LayoutProps) {
  return (
    <>
      <Head>
        <title>{props.title}</title>
        <script
          defer
          src='https://cdnjs.cloudflare.com/ajax/libs/turbolinks/5.2.0/turbolinks.js'
          integrity='sha512-G3jAqT2eM4MMkLMyQR5YBhvN5/Da3IG6kqgYqU9zlIH4+2a+GuMdLb5Kpxy6ItMdCfgaKlo2XFhI0dHtMJjoRw=='
          crossOrigin='anonymous'
          referrerpolicy='no-referrer'
        />
      </Head>
      <body className='h-full relative'>
        <section className='pb-14 md:pb-0'>
          {props.variant != 'standard-without-nav' && <Sidebar route={props.route} />}
          <section className={(props.variant != 'standard-without-nav' ? 'md:pl-72' : '')}>
            <Header
              title={props.title}
              avatarUrl={props.avatarUrl}
              variant={props.variant}
            />
            {props.children}
          </section>
        </section>
        {props.variant != 'standard-without-nav' && <BottomNav route={props.route}/>}
      </body>
    </>
  )
}
