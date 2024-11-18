import Layout from '../../../components/library/Layout.tsx'
import { OrganizationContext } from './[organization_id]/_middleware.ts'

// deno-lint-ignore require-await
export default async function OrganizationPage(
  _req: Request,
  ctx: OrganizationContext,
) {
  const { organization } = ctx.state

  return (
    <Layout
      title={organization.name}
      route={ctx.route}
      url={ctx.url}
      health_worker={ctx.state.healthWorker}
      variant='practitioner home page'
    >
      `<div>
        <div class='px-4 sm:px-0'>
          <h3 class='text-base/7 font-semibold text-gray-900'>
            {organization.name}
          </h3>
          <p class='mt-1 max-w-2xl text-sm/6 text-gray-500'>
            {organization.address}
          </p>
        </div>
        <div class='mt-6 border-t border-gray-100'>
          <dl class='divide-y divide-gray-100'>
            <div class='bg-gray-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3'>
              <dt class='text-sm/6 font-medium text-gray-900'>
                Organization Type
              </dt>
              <dd class='mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0'>
                {organization.category}
              </dd>
            </div>
            <div class='bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3'>
              <dt class='text-sm/6 font-medium text-gray-900'>Address</dt>
              <dd class='mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0'>
                {organization.address}
              </dd>
            </div>
            <div class='bg-gray-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3'>
              <dt class='text-sm/6 font-medium text-gray-900'>
                Organization ID
              </dt>
              <dd class='mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0'>
                {organization.id}
              </dd>
            </div>
          </dl>
        </div>
      </div>`
    </Layout>
  )
}
