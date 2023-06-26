import { Head } from '$fresh/runtime.ts'
import { JSX } from 'preact'
import BottomNav from './BottomNav.tsx'
import { Header } from './Header.tsx'
import { Sidebar } from './Sidebar.tsx'

export type LayoutProps = {
  title: string
  route: string
  children: JSX.Element | JSX.Element[]
  imageUrl?: string
  isShowNav?: boolean
}

export default function NewLayout(props: LayoutProps) {
  return (
    <>
      <Head>
        <title>{props.title}</title>
        <link rel='stylesheet' href='/normalize.css' />
        <link rel='stylesheet' href='/main.css' />
        <script
          defer
          src='https://cdnjs.cloudflare.com/ajax/libs/turbolinks/5.2.0/turbolinks.js'
          integrity='sha512-G3jAqT2eM4MMkLMyQR5YBhvN5/Da3IG6kqgYqU9zlIH4+2a+GuMdLb5Kpxy6ItMdCfgaKlo2XFhI0dHtMJjoRw=='
          crossOrigin='anonymous'
          referrerpolicy='no-referrer'
        />
      </Head>
      <body className='h-full relative'>
        <section>
          <Sidebar route={props.route} />
          <section className='md:pl-72'>
            <Header title={props.title} imageUrl={props.imageUrl} isShowNav={props.isShowNav} />
            {props.children}
          </section>
        </section>
        <BottomNav route={props.route} />
      </body>
    </>
  )
}
