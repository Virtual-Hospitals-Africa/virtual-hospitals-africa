import GridPattern from '../../islands/landing-page/GridPattern.tsx'
import MHIHomeLink from '../../islands/landing-page/MHIDotsLogo.tsx'

export function Footer() {
  return (
    <footer className='relative flex flex-row w-full items-between p-4 pt-5 sm:pt-14'>
      <div className='relative text-sm text-slate-600'>
        <p>
          &copy; {new Date().getFullYear()} Health Gateway Africa Trust
        </p>
      </div>
      <MHIHomeLink />
    </footer>
  )
}
