import { useSignal } from '@preact/signals'
import FormRow from '../components/library/FormRow.tsx'
import FormSection from '../components/library/FormSection.tsx'
import { Button } from '../components/library/Button.tsx'
import { PhoneNumberInput } from './form/inputs/phone_number.tsx'
import { SelectWithOptions } from './form/inputs/select_with_options.tsx'
import { TextInput } from './form/inputs/text.tsx'
import { Maybe } from '../types.ts'

const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Spouse',
  'Sibling',
  'Child',
  'Friend',
  'Partner',
  'Other',
]

export default function EmergencyContactSection({
  existing_contacts,
}: {
  existing_contacts?: Array<{
    name: string
    relationship: string
    phone_number: Maybe<string>
  }>
}) {
  const contacts = useSignal(
    existing_contacts && existing_contacts.length > 0 ? existing_contacts : [{ name: '', relationship: '', phone_number: '' }],
  )
  const addContact = () => {
    contacts.value = [
      ...contacts.value,
      { name: '', relationship: '', phone_number: '' },
    ]
  }

  const removeContact = (index: number) => {
    if (contacts.value.length > 1) {
      contacts.value = contacts.value.filter((_, i) => i !== index)
    }
  }

  return (
    <FormSection header='Emergency Contacts'>
      {contacts.value.map((contact, index) => (
        <div key={index} className='space-y-3'>
          {index > 0 && <div className='border-t border-gray-200 pt-4' />}

          <FormRow>
            <TextInput
              name={`emergency_contacts[${index}].name`}
              label='Name'
              placeholder='Name'
              required
              value={contact.name}
            />

            <SelectWithOptions
              name={`emergency_contacts[${index}].relationship`}
              label='Relationship'
              blank_option='Select Relationship'
              options={RELATIONSHIP_OPTIONS}
              required
              value={contact.relationship}
            />
          </FormRow>

          <FormRow>
            <PhoneNumberInput
              name={`emergency_contacts[${index}].phone_number`}
              label='Phone Number'
              value={contact.phone_number}
            />
          </FormRow>

          {contacts.value.length > 1 && (
            <div className='flex justify-end'>
              <Button
                type='button'
                onClick={() => removeContact(index)}
                variant='primary'
              >
                Remove Contact
              </Button>
            </div>
          )}
        </div>
      ))}

      <div className='mt-4'>
        <Button
          type='button'
          onClick={addContact}
          variant='primary'
        >
          + Add Contact
        </Button>
      </div>
    </FormSection>
  )
}
