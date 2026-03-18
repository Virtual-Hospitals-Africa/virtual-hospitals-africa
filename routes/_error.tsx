import { HttpError, PageProps } from 'fresh'
import { LogoWithFullText } from '../components/library/Logo.tsx'

function GenericErrorPage({ code, title, message }: { code: number | string; title: string; message: string }) {
  return (
    <div class='min-h-screen bg-indigo-50 flex flex-col items-center justify-center px-4'>
      <a href='/' class='mb-10'>
        <LogoWithFullText variant='indigo' class='h-12 w-auto' />
      </a>
      <p class='text-8xl font-bold text-indigo-900 mb-4'>{code}</p>
      <h1 class='text-2xl font-semibold text-indigo-900 mb-2'>
        {title}
      </h1>
      <p class='text-slate-500 mb-8 text-center max-w-sm'>
        {message}
      </p>
      <a
        href='/'
        class='inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-700 text-white font-medium hover:bg-indigo-800 transition-colors'
      >
        Go home
      </a>
    </div>
  )
}

function UnexpectedError() {
  return <GenericErrorPage code='!' title='Something went wrong' message='An unexpected error occurred. Please try again later.' />
}

export default function ErrorPage(props: PageProps) {
  const error = props.error

  if (error instanceof HttpError) {
    switch (error.status) {
      case 400:
        return <GenericErrorPage code={400} title='Bad request' message='The request was invalid or malformed.' />
      case 401:
        return <GenericErrorPage code={401} title='Unauthorized' message='You need to be logged in to access this page.' />
      case 403:
        return <GenericErrorPage code={403} title='Forbidden' message="You don't have permission to access this page." />
      case 404:
        return <GenericErrorPage code={404} title='Not found' message="The page you're looking for doesn't exist or has been moved." />
      case 405:
        return <GenericErrorPage code={405} title='Method not allowed' message='This action is not permitted here.' />
      case 409:
        return <GenericErrorPage code={409} title='Conflict' message='The request could not be completed due to a conflict.' />
      case 410:
        return <GenericErrorPage code={410} title='Gone' message='This page has been permanently removed.' />
      case 422:
        return <GenericErrorPage code={422} title='Unprocessable request' message='The request was well-formed but could not be processed.' />
      case 429:
        return <GenericErrorPage code={429} title='Too many requests' message="You've made too many requests. Please slow down and try again." />
    }
  }

  return <UnexpectedError />
}
