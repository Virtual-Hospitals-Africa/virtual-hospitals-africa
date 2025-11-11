import { TargetsRow } from './TargetsRow.tsx'

export default function MessageDraftTargets() {
  return (
    <div>
                {/* Regions Row */}
                <TargetsRow
                  label='Regions'
                  message_target_categories={['region']}
                  targets={regions}
                />
      
                {/* Facilities Row */}
                <TargetsRow
                  label='Facilities'
                  message_target_categories={['organization']}
                  targets={facilities}
                />
      
                {/* Recipients Row */}
                <TargetsRow
                  label='Recipients'
                  message_target_categories={['employment', 'profession']}
                  targets={recipients}
                >
                  <span class='ml-auto text-sm text-gray-600 whitespace-nowrap'>
                    Total recipient count: 98
                  </span>
                </TargetsRow>
    </div>
  )
}
