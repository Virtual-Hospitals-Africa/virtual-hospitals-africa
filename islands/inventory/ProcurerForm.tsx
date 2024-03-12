import { JSX } from 'preact'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Form from '../../components/library/form/Form.tsx'
import FormRow from '../../components/library/form/Row.tsx'
import { Button } from '../../components/library/Button.tsx'
import { TextInput } from '../../components/library/form/Inputs.tsx'

export default function ProcurerForm(): JSX.Element {
  return (
    <div>
      <SectionHeader className='my-5 text-[20px]'>
        Add Procurer
      </SectionHeader>
      <div>
        <Form method='post'>
          <div className='flex flex-col w-full gap-2'>
            <FormRow>
              <TextInput
                name={`name`}
                label='Name'
                required
              />
            </FormRow>
            <FormRow>
              <Button type='submit'>
                Submit
              </Button>
            </FormRow>
          </div>
        </Form>
      </div>
    </div>
  )
}
