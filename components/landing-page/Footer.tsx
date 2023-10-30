import { BuiltWith } from '../../islands/landing-page/MHIDotsLogo.tsx'

export function Footer({ withMhi }: { withMhi?: boolean }) {
  return (
    <footer className='relative flex flex-col-reverse md:flex-row w-full items-between p-6 pt-5 sm:pt-14 justify-between items-center self-end'>
      <div className='relative text-sm text-slate-600 mt-8 md:mt-auto'>
        <p>
          &copy; {new Date().getFullYear()} Virtual Hospitals Africa Trust
        </p>
      </div>
      {withMhi ? <BuiltWith /> : <div />}
    </footer>
  )
}
