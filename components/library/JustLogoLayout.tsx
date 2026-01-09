import { ComponentChildren } from 'preact'
import { Header } from './Header.tsx'
import { SimpleFooter } from '../landing-page/Footer.tsx'

export default function JustLogoLayoutContents({
  title,
  children,
}: {
  title: string
  children: ComponentChildren
}) {
  return (
    <>
      <Header title={title} variant='just logo' />
      <section className='flex flex-col justify-between grow min-h-full p-6 align-center'>
        {children}
      </section>
      <SimpleFooter />
    </>
  )
}
