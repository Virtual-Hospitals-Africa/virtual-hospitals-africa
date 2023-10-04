import { EmployedHealthWorker, LoggedInHealthWorkerHandler, Maybe } from "../../types.ts"
// import { EmployedHealthWorker, ReturnedSqlRow } from "../../types.ts"
import { Facility } from "../../types.ts"
import { Employee } from "../../types.ts"
import { assert } from "std/assert/assert.ts"
import { PageProps } from "$fresh/server.ts"
import Layout from "../../components/library/Layout.tsx"
import { activeTab, Tabs } from "../../components/library/Tabs.tsx"
import * as health_workers from '../../db/models/health_workers.ts'
import {getFacilityAdmin} from "../../db/models/employment.ts"


// QUESTION: What if there are multiple admins for the facililty? DO we just pick up the first one?

type PendingApprovalPageProps = {
    test: string
    healthWorker: Maybe<EmployedHealthWorker>
    facilityAdmin: Maybe<Employee>
}

export const handler: LoggedInHealthWorkerHandler<PendingApprovalPageProps, {
}> = {
    async GET(req, ctx) {
        console.log(ctx.state)

        const healthWorker = await health_workers.get(ctx.state.trx, {
            health_worker_id: ctx.state.healthWorker.id,
        })
        assert(healthWorker)

        console.log(healthWorker)

        const facilityAdmin = await getFacilityAdmin(ctx.state.trx, {
            facility_id: healthWorker.employment[0].facility_id,
        })


        console.log(facilityAdmin)

        return ctx.render({
            test: 'test message',
            healthWorker: healthWorker,
            facilityAdmin: facilityAdmin
        })
    },
}

export default function PendingApprovalPage(
    props: PageProps<PendingApprovalPageProps>,
) {
    return (
        <div>
            <h1>Pending Approval: {props.data.test}</h1>
        </div>
        // <Layout
        //     title='Pending Approval'
        //     route={props.route}
        //     avatarUrl={props.data.healthWorker.avatar_url}
        //     variant='standard'
        // >
        //     <div>
        //         <h1>Pending Approval</h1>
        //     </div>
        // </Layout>
    )
}