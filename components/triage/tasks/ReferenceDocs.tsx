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

function toPdfViewerHref(href: string): string {
  const hash_index = href.indexOf('#')
  const path = hash_index === -1 ? href : href.slice(0, hash_index)
  const hash = hash_index === -1 ? '' : href.slice(hash_index)
  const file = path.startsWith('/') ? path.slice(1) : path
  return `/view_pdf?file=${file}${hash}`
}

function ReferenceDoc({ reference_doc, use_pdf_viewer }: {
  reference_doc: ReferenceDoc
  use_pdf_viewer: boolean
}) {
  assert(reference_doc.thumbnail_href)
  const href = use_pdf_viewer && reference_doc.href.endsWith('.pdf') ? toPdfViewerHref(reference_doc.href) : reference_doc.href

  // const href = toPdfViewerHref(
  //   'medical-resources/za/eml/named-destinations/Hospital-Level-Adults-Standard-Treatment-Guidelines-and-EMP-6th-Edition-2024.pdf#3.2.2-Clopidogrel',
  // )

  return (
    <a href={href} className='flex text-sm font-medium text-gray-600 leading-5 w-fit'>
      <figure>
        <img width='400' src={reference_doc.thumbnail_href} />
        <figcaption>{reference_doc.title}</figcaption>
      </figure>
    </a>
  )
}

export function ReferenceDocs({ reference_docs, due_to, organization_id, use_pdf_viewer = false }: {
  reference_docs: ReferenceDoc[]
  due_to: null | (RenderedFindingRelativeToHealthWorker | RenderedEvaluationRelativeToHealthWorker)[]
  organization_id?: string
  use_pdf_viewer?: boolean
}) {
  if (!reference_docs.length) return null
  return (
    <div id='reference-docs' class='flex flex-col gap-2'>
      <SectionHeader className='w-full xl:w-60 mb-2'>
        Reference Documents
      </SectionHeader>
      {due_to && <DueTo due_to={due_to} organization_id={organization_id!} />}
      {reference_docs.map(
        (reference_doc) => <ReferenceDoc key={reference_doc.href} reference_doc={reference_doc} use_pdf_viewer={use_pdf_viewer} />,
      )}
    </div>
  )
}
