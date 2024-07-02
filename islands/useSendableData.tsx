import { useState, useEffect } from 'react';
import { updateOnlineStatus } from './SendToMenu.tsx'; 
import { Sendable } from './types.ts';


export function useSendableData(initialData : Sendable[]) {
  const [sendableData, setSendableData] = useState(initialData);

  useEffect(() => {
    async function fetchUpdatedStatus() {
      if (initialData && initialData.length > 0) {
        const updatedData = await updateOnlineStatus(initialData);
        setSendableData(updatedData);
      }
    }

    fetchUpdatedStatus();
  }, [initialData]);

  return sendableData;
}
