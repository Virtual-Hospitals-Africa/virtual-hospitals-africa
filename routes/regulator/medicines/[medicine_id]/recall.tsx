import * as medicines from '../../../../db/models/drugs.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { Button } from '../../../../components/library/Button.tsx'
import { assertOr404 } from '../../../../util/assertOr.ts'
import { LoggedInRegulator } from '../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import redirect from '../../../../util/redirect.ts'
import { FreshContext } from '$fresh/server.ts'
import Form from '../../../../components/library/Form.tsx'

export const handler = {
    POST: async function RecallMedication(
        _req: Request,
        ctx: FreshContext<LoggedInRegulator>,
    ) {
        const medicine_id = getRequiredUUIDParam(ctx, 'medicine_id')
        
        const manufacturedMedication = await medicines.getById(ctx.state.trx, medicine_id)
        
        assertOr404(manufacturedMedication, 'Medicine not found')
        
        await medicines.recall(ctx.state.trx, {
            manufactured_medication_id: medicine_id,
            regulator_id: '1bb5e8a0-bf9d-41a4-95da-3de03e737622',
        })
        
        return redirect('/regulator/medicines')
    },
}

export default async function RecallPage(
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>
) {
    const medicine_id = getRequiredUUIDParam(ctx, 'medicine_id')
    
    const manufacturedMedication = await medicines.getById(ctx.state.trx, medicine_id)
    
    assertOr404(manufacturedMedication, 'Medicine not found')

    return (
        <Layout
            title='Confirm Recall'
            route={ctx.route}
            url={ctx.url}
            regulator={ctx.state.regulator}
            variant='regulator home page'
        >
            <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
                Recall {manufacturedMedication.generic_name} ({manufacturedMedication.trade_name}) by {manufacturedMedication.applicant_name} ?
                <br />
                Strength Summary: {manufacturedMedication.strength_summary}
                
                <Form method='POST'>
                    <Button type='submit'>Recall</Button>
                </Form>
            </div>
        </Layout>
    )
}
