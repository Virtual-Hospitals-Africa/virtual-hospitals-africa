import { EmptyState } from "../library/EmptyState.tsx";
import { UserCircleIcon } from "../library/icons/heroicons/solid.tsx";

export default function PatientsEmptyState() {
  return (
    <EmptyState
      header="No patients"
      explanation="Patients must be added through the Waiting Room"
      icon={<UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />}
    />
  );
}
