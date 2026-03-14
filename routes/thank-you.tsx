import { Context } from 'fresh'
import JustLogoLayout from '../components/library/JustLogoLayout.tsx'

// deno-lint-ignore require-await
export default async function ThankYouPage(ctx: Context<unknown>) {
  const message = ctx.url.searchParams.get('message')
  return (
    <JustLogoLayout url={ctx.url} title='Virtual Hospitals Africa'>
      <div className='flex flex-col items-center justify-center gap-8 py-12 text-center max-w-lg mx-auto'>
        <img
          src='/images/gratitude.jpg'
          alt='Hands held together in gratitude'
          className='rounded-2xl shadow-lg w-full max-w-sm object-cover'
        />
        <div className='flex flex-col gap-3'>
          <h1 className='text-3xl font-bold text-gray-900'>Thank You</h1>
          {message && <p className='text-lg text-gray-600'>{message}</p>}
        </div>
      </div>
    </JustLogoLayout>
  )
}
