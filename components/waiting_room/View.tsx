import { AddPatientSearch } from "../../islands/waiting_room/AddPatientSearch.tsx";
import { RenderedWaitingRoom } from "../../types.ts";
import { Button } from "../library/Button.tsx";
import FormRow from "../library/FormRow.tsx";
import WaitingRoomTable from "./Table.tsx";

export default function WaitingRoomView({
  waiting_room,
  organization_id,
  can_add_patients,
}: {
  waiting_room: RenderedWaitingRoom[];
  organization_id: string;
  can_add_patients: boolean;
}) {
  const intake_patient_href = `/app/organizations/${organization_id}/patients/new/intake`;
  return (
    <>
      <FormRow className="mb-4">
        <AddPatientSearch
          organization_id={organization_id}
          can_add_patients={can_add_patients}
        />
        {can_add_patients && (
          <Button
            type="button"
            href={intake_patient_href}
            className="w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center"
          >
            Intake patient
          </Button>
        )}
      </FormRow>
      <WaitingRoomTable
        waiting_room={waiting_room}
        add_href={intake_patient_href}
        can_add_patients={can_add_patients}
      />
    </>
  );
}
