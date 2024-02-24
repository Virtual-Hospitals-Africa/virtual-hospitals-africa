import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../components/library/Container.tsx'
import { ICD10SearchSpecific } from '../../islands/icd10/SearchSpecific.tsx'

// deno-lint-ignore require-await
export default async function ICD10SearchPage(
  _req: Request,
  _ctx: FreshContext,
) {
  return (
    <div className='p-4'>
      <ICD10SearchSpecific
        name=''
        label='ICD10'
        href='/app/icd10'
        className='w-full'
      />
    </div>
  )
}
