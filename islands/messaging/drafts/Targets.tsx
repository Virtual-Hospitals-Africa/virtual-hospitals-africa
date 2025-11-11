import { TargetsRow } from './TargetsRow.tsx'

export default function MessageDraftTargets() {
  return (
    <div>
                {/* Regions Row */}
                <TargetsRow
                  label='Regions'
                  target_types={['region']}
                  targets={regions}
                />
      
                {/* Facilities Row */}
                <TargetsRow
                  label='Facilities'
                  target_types={['organization']}
                  targets={facilities}
                />
      
                {/* Recipients Row */}
                <TargetsRow
                  label='Recipients'
                  target_types={['employment', 'profession']}
                  targets={recipients}
                >
                  <span class='ml-auto text-sm text-gray-600 whitespace-nowrap'>
                    Total recipient count: 98
                  </span>
                </TargetsRow>
    </div>
  )
}
