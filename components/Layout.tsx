import { Head } from '$fresh/runtime.ts'
import { JSX } from 'preact'
import BottomNav from './BottomNav.tsx'

export type LayoutProps = {
  title: string
  route: string
  children: JSX.Element | JSX.Element[]
}

export default function Layout(props: LayoutProps) {
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
        <nav>
          <a class='back' onClick={() => window.history.back()}>
            <svg
              class='back-arrow'
              viewBox='0 0 16 16'
            >
              <path
                d='M16 7H3.83L9.42 1.41L8 0L0 8L8 16L9.41 14.59L3.83 9H16V7Z'
                fill='white'
              >
              </path>
            </svg>
          </a>
          <h1>{props.title}</h1>
        </nav>
        {props.children}
        <BottomNav route={props.route} />
      </body>
    </>
  )
}
