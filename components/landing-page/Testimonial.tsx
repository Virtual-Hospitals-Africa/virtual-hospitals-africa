import { JSX } from 'preact'
import { Container } from '../../components/library/Container.tsx'
import MedicalIconPattern from './MedicalIconPattern.tsx'

export function Testimonial(
  { id, author, children }: {
    id: string
    author: { name: string; image: string; role: string }
    children: JSX.Element
  },
) {
  return (
    <aside
      id={id}
      aria-label={`Testimonial from ${author.name}`}
      className='relative bg-slate-100 py-16 sm:py-32'
    >
      <div className='text-slate-900/10'>
        <MedicalIconPattern />
      </div>
      <Container
        size='xs'
        className='relative'
      >
        <figure>
          <blockquote className='font-display text-xl md:text-4xl font-medium tracking-tight text-slate-900 sm:text-center bg-indigo-900 text-white rounded-lg md:p-12 p-4'>
            {children}
          </blockquote>
          <figcaption className='mt-6 flex items-center sm:justify-center'>
            <div className='border-2 border-solid border-gray-500 bg-white rounded-full flex items-center py-1 pl-2 pr-4'>
              <div className='overflow-hidden rounded-full bg-slate-200'>
                <img
                  className='h-12 w-12 object-cover'
                  src={author.image}
                  alt=''
                  width={48}
                  height={48}
                />
              </div>
              <div className='ml-4'>
                <div className='text-base font-medium leading-6 tracking-tight text-slate-900'>
                  {author.name}
                </div>
                <div className='mt-1 text-sm text-slate-600'>{author.role}</div>
              </div>
            </div>
          </figcaption>
        </figure>
      </Container>
    </aside>
  )
}
