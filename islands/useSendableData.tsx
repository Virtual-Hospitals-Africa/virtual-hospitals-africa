import { useEffect, useState } from 'react'
import { updateOnlineStatus } from './SendToMenu.tsx'

export function useSendableData(initialData) {
  const [sendableData, setSendableData] = useState(initialData)

  useEffect(() => {
    async function fetchUpdatedStatus() {
      if (initialData && initialData.length > 0) {
        const updatedData = await updateOnlineStatus(initialData)
        setSendableData(updatedData)
      }
    }

    fetchUpdatedStatus()
  }, [initialData])

  return sendableData
}
