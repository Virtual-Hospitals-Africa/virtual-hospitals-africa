import Link from 'next/link'

import { CheckIcon } from './CheckIcon'
import { Container } from './Container'

export function Introduction() {
  return (
    <section
      id='introduction'
      aria-label='Introduction'
      className='pb-16 pt-20 sm:pb-20 md:pt-36 lg:py-32'
    >
      <Container className='text-lg tracking-tight text-slate-700'>
        <p className='font-display text-4xl font-bold tracking-tight text-slate-900'>
          “Everything Starts as a Square” is a book and video course that
          teaches you a simple method to designing icons that anyone can learn.
        </p>
        <p className='mt-4'>
          Before I learned how to design icons myself, I always imagined that
          they were drawn by hand using the pen tool, some sort of fancy
          graphics tablet, and hours and hours spent manually fine-tuning bezier
          curves.
        </p>
        <p className='mt-4'>
          But it turns out this isn’t how great icon designers work at all.
        </p>
        <p className='mt-4'>
          In “Everything Starts as a Square”, you’ll learn the systems experts
          use to create pixel perfect icons, without relying on a steady hand.
        </p>
        <ul role='list' className='mt-8 space-y-3'>
          {[
            'Using boolean operations to combine basic shapes into complex icons',
            'How to adapt icons to different sizes',
            'Translating icons from an outline style to a solid style',
            'Identifying the characteristics that make an icon set cohesive',
            'Figma features and keyboard shortcuts to speed up your workflow',
          ].map((feature) => (
            <li key={feature} className='flex'>
              <CheckIcon className='h-8 w-8 flex-none fill-blue-500' />
              <span className='ml-4'>{feature}</span>
            </li>
          ))}
        </ul>
        <p className='mt-8'>
          By the end of the book, you’ll have all the confidence you need to dig
          in and start creating beautiful icons that can hold their own against
          any of the sets you can find online.
        </p>
        <p className='mt-10'>
          <Link
            href='#free-chapters'
            className='text-base font-medium text-blue-600 hover:text-blue-800'
          >
            Get two free chapters straight to your inbox{' '}
            <span aria-hidden='true'>&rarr;</span>
          </Link>
        </p>
      </Container>
    </section>
  )
}
