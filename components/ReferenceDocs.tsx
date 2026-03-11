import { assert } from 'std/assert/assert.ts'
import SectionHeader from './library/typography/SectionHeader.tsx'
import { Maybe } from '../types.ts'

type ReferenceDoc = {
  thumbnail_href?: Maybe<string>
  href: string
  title: string
}

function ReferenceDoc({ reference_doc }: {
  reference_doc: ReferenceDoc
}) {
  assert(reference_doc.thumbnail_href)
  return (
    <a href={reference_doc.href} className='flex text-sm font-medium text-gray-600 leading-5'>
      <figure>
        <img width='400' src={reference_doc.thumbnail_href} />
        <figcaption>{reference_doc.title}</figcaption>
      </figure>
    </a>
  )
}

export function ReferenceDocs({ reference_docs }: {
  reference_docs: ReferenceDoc[]
}) {
  if (!reference_docs.length) return null
  return (
    <div class='flex flex-col gap-4'>
      <SectionHeader className='w-full xl:w-60'>
        Reference Documents
      </SectionHeader>
      <ul class='flex flex-col gap-2'>
        {reference_docs.map(
          (reference_doc) => <ReferenceDoc key={reference_doc.href} reference_doc={reference_doc} />,
        )}
      </ul>
    </div>
  )
}
