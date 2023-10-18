import { BuiltWith } from '../../islands/landing-page/MHIDotsLogo.tsx'

export function Footer() {
  return (
    <footer className='relative flex flex-row w-full items-between p-6 pt-5 sm:pt-14 justify-between items-center'>
      <div className='relative text-sm text-slate-600'>
        <p>
          &copy; {new Date().getFullYear()} Virtual Hospitals Africa Trust
        </p>
      </div>
      <BuiltWith />
    </footer>
  )
}
