import { ComponentChildren } from 'preact'
import { Header } from './Header.tsx'
import { SimpleFooter } from '../landing-page/Footer.tsx'
import { AlertListener } from '../../islands/alert/AlertListener.tsx'

export default function JustLogoLayout({
  url,
  title,
  children,
}: {
  url: URL
  title: string
  children: ComponentChildren
}) {
  return (
    <>
      <AlertListener initial_url={url} />
      <Header title={title} variant='just logo' />
      <section className='flex flex-col justify-between grow min-h-full p-6 align-center'>
        {children}
      </section>
      <SimpleFooter />
    </>
  )
}
