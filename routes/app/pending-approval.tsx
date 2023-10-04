import { LoggedInHealthWorkerHandler } from "../../types.ts"
import { HealthWorkerWithGoogleTokens, ReturnedSqlRow } from "../../types.ts"
import { Facility } from "../../types.ts"
import { Employee } from "../../types.ts"
import { assert } from "std/assert/assert.ts"
import { PageProps } from "$fresh/server.ts"
import Layout from "../../components/library/Layout.tsx"
import { activeTab, Tabs } from "../../components/library/Tabs.tsx"


type PendingApprovalPageProps = {
    test: string
    // healthWorker: HealthWorkerWithGoogleTokens
    // facility: ReturnedSqlRow<Facility>
    // employment: ReturnedSqlRow<Employee>
    // role: 'nurse' | 'doctor' | 'admin'
}

export const handler: LoggedInHealthWorkerHandler<PendingApprovalPageProps, {
    facility: ReturnedSqlRow<Facility>
}> = {
    GET(req, ctx) {
        console.log(ctx.state)

        return ctx.render({test: 'test message'})
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