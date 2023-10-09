import { EmployedHealthWorker, LoggedInHealthWorkerHandler, Maybe } from "../../types.ts"
// import { EmployedHealthWorker, ReturnedSqlRow } from "../../types.ts"
import { Facility } from "../../types.ts"
import { Employee } from "../../types.ts"
import { assert } from "std/assert/assert.ts"
import { PageProps } from "$fresh/server.ts"
import Layout from "../../components/library/Layout.tsx"
import { activeTab, Tabs } from "../../components/library/Tabs.tsx"
import * as health_workers from '../../db/models/health_workers.ts'
import {FacilityAdminInfo, getFacilityAdminInfo} from "../../db/models/employment.ts"

type PendingApprovalPageProps = {
    healthWorker: EmployedHealthWorker
    facilityAdmin: FacilityAdminInfo
}

export const handler: LoggedInHealthWorkerHandler<PendingApprovalPageProps, {
}> = {
    async GET(req, ctx) {
        console.log(ctx.state)

        const healthWorker = await health_workers.get(ctx.state.trx, {
            health_worker_id: ctx.state.healthWorker.id,
        })
        assert(healthWorker)

        const facilityAdmin = await getFacilityAdminInfo(ctx.state.trx, {
            facility_id: healthWorker.employment[0].facility_id,
        })

        return ctx.render({
            healthWorker: healthWorker,
            facilityAdmin: facilityAdmin
        })
    },
}

export default function PendingApprovalPage(
    props: PageProps<PendingApprovalPageProps>,
) {
    console.log(props)
    return (
        <Layout
            title='Virtual Hospitals Africa'
            route={'/app/pending-approval'}
            avatarUrl={''}
            variant='standard-without-nav'
        >
        <div class="overflow-hidden bg-white py-32">
            <div class="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
                <div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8">
                <div class="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">
                    <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Application under review
                    </h2>
                    <p class="mt-6 text-xl leading-8 text-gray-600">
                    Your application from {props.data.facilityAdmin.facility_name} is currently under review by {props.data.facilityAdmin.name}. You will receive an email once your application has been approved.
                    </p>
                    <div class="mt-10 flex">
                    <a href="/" class="rounded-md bg-lime-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600">
                        Homepage
                        <span aria-hidden="true"> &rarr;</span>
                    </a>
                    </div>
                </div>
                <div class="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
                    <div class="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
                    <img
                      src={'https://images.unsplash.com/photo-1670272502246-768d249768ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1152&q=80'}
                      alt='Pending Approval'
                      className='aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover'
                    />
                    </div>
                </div>
                </div>
            </div>
        </div>
        </Layout>
    )
}