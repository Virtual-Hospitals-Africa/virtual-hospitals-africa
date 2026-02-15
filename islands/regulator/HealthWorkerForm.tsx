import { useSignal } from '@preact/signals'
import FormRow from '../../components/library/FormRow.tsx'
import Buttons from '../form/buttons.tsx'
import type { DeepPartial, RenderedCountryHealthWorker } from '../../types.ts'
import Form from '../../components/library/Form.tsx'
import OrganizationSearch from '../OrganizationSearch.tsx'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import { SelectWithOptions } from '../form/inputs/select_with_options.tsx'
import { DateInput } from '../form/inputs/date.tsx'
import { PrefixSelect } from '../form/inputs/prefix.tsx'
import { TextInput } from '../form/inputs/text.tsx'
import FormGrid from '../../components/library/FormGrid.tsx'
import { NamesInputs } from '../patient-registration/NamesInputs.tsx'
import { SexAndGenderInputs } from '../patient-registration/SexAndGenderInputs.tsx'

type HealthWorkerForm = {
  form_data: DeepPartial<RenderedCountryHealthWorker>
  country: string
}

export default function HealthWorkerForm(
  { form_data, country }: HealthWorkerForm,
) {
  const selected_organizations = useSignal<OrganizationOption[]>(
    form_data.organizations ?? [],
  )
  const addOrganization = () => {
    selected_organizations.value = [
      ...selected_organizations.value,
      {
        is_supervisor: false,
        id: '',
        name: '',
        removed: false,
      },
    ]
  }
  const remove = (selectedIndex: number) => {
    selected_organizations.value = selected_organizations.value.map(
      (organization, index) => {
        if (index !== selectedIndex) return organization
        return {
          ...organization,
          removed: true,
        }
      },
    )
  }
  return (
    <Form method='POST'>
      <FormRow>
        <FormGrid columns={3}>
          <NamesInputs names={form_data || {}} />
          <DateInput
            name='date_of_birth'
            value={form_data.licence?.date_of_birth}
            required
          />
          <SexAndGenderInputs
            sex={form_data.licence?.sex ?? null}
            gender={form_data.licence?.gender ?? null}
          />
        </FormGrid>
      </FormRow>
      <FormRow>
        <TextInput
          name='licence_number'
          required
          type='text'
          label='Licence Number'
          value={form_data.licence_number}
          // placeholder='P01-0805-2024'
          // pattern='^[A-Z]{1}[0-9]{2}-[0-9]{4}-[0-9]{4}$'
        />
        <DateInput
          name='expiry_date'
          required
          label='Expiry Date'
          value={form_data.expiry_date}
        />
      </FormRow>
      <FormRow>
        <PrefixSelect value={form_data.prefix} />
      </FormRow>
      <FormRow>
        <TextInput
          name='town'
          required
          type='text'
          label='Town'
          value={form_data.town}
        />
        <TextInput
          name='address'
          required
          type='text'
          label='Address'
          value={form_data.address}
        />
      </FormRow>
      <hr className='my-2' />
      {selected_organizations.value.map((selected_organization, index) =>
        !selected_organization.removed && (
          <RemoveRow onClick={() => remove(index)} key={index} labelled>
            <FormRow>
              <OrganizationSearch
                filters={{ country }}
                name={`organizations.${index}`}
                label='Organization'
                value={selected_organization}
                required
                onSelect={(organization) => {
                  selected_organizations.value[index] = {
                    ...selected_organizations.value[index],
                    ...organization,
                  }
                }}
              />
              <SelectWithOptions
                required={selected_organization.name !== undefined}
                name={`organizations.${index}.is_supervisor`}
                label='Is Supervisor'
                blank_option
                options={[{
                  id: 'true',
                  name: 'Yes',
                }, {
                  id: 'false',
                  name: 'No',
                }]}
              />
            </FormRow>
          </RemoveRow>
        )
      )}
      <AddRow
        text='Add Organization'
        onClick={addOrganization}
      />
      <hr className='my-2' />
      <Buttons submitText='Submit' />
    </Form>
  )
}
