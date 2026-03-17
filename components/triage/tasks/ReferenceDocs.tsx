import { assert } from 'std/assert/assert.ts'

import { Maybe } from '../../../types.ts'
import { RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker } from '../../../types.ts'
import { DueTo } from './DueTo.tsx'
import SectionHeader from '../../library/typography/SectionHeader.tsx'

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
    <a href={reference_doc.href} className='flex text-sm font-medium text-gray-600 leading-5 w-fit'>
      <figure>
        <img width='400' src={reference_doc.thumbnail_href} />
        <figcaption>{reference_doc.title}</figcaption>
      </figure>
    </a>
  )
}

export function ReferenceDocs({ reference_docs, due_to, organization_id }: {
  reference_docs: ReferenceDoc[]
  due_to: null | (RenderedFindingRelativeToHealthWorker | RenderedEvaluationRelativeToHealthWorker)[]
  organization_id?: string
}) {
  if (!reference_docs.length) return null
  return (
    <div id='reference-docs' class='flex flex-col gap-2'>
      <SectionHeader className='w-full xl:w-60 mb-2'>
        Reference Documents
      </SectionHeader>
      {due_to && <DueTo due_to={due_to} organization_id={organization_id!} />}
      {reference_docs.map(
        (reference_doc) => <ReferenceDoc key={reference_doc.href} reference_doc={reference_doc} />,
      )}
    </div>
  )
}
