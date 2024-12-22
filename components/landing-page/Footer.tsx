import { BuiltWith } from '../../islands/landing-page/MHIDotsLogo.tsx'

function Copyright() {
  return <>&copy; {new Date().getFullYear()} Virtual Hospitals Africa</>
}

export function SimpleFooter() {
  return (
    <footer className='relative flex flex-col-reverse md:flex-row w-full items-between p-6 pt-5 sm:pt-14 justify-between items-center self-end'>
      <div className='relative text-sm text-slate-600 mt-8 md:mt-auto'>
        <p>
          <Copyright />
        </p>
      </div>
    </footer>
  )
}

const navigation = {
  main: [
    { name: 'Privacy Policy', href: '/privacy.html' },
    { name: 'Terms of Service', href: '/terms-of-service.html' },
  ],
}

export function FullFooter() {
  return (
    <footer className='bg-white'>
      <div className='mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8'>
        <nav
          aria-label='Footer'
          className='-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6'
        >
          {navigation.main.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className='text-gray-600 hover:text-gray-900'
            >
              {item.name}
            </a>
          ))}
        </nav>
        <div className='mt-16 flex justify-center gap-x-10'>
          <BuiltWith />
        </div>
        <p className='mt-10 text-center text-sm/6 text-gray-600'>
          <Copyright />
        </p>
      </div>
    </footer>
  )
}
