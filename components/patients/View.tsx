import { SearchInput } from "../../islands/form/Inputs.tsx";
import PatientCards from "../../islands/patient-cards.tsx";
import { RenderedPatient } from "../../types.ts";
import FormRow from "../library/FormRow.tsx";
import PatientsTable from "./Table.tsx";

export default function PatientsView({
  patients,
}: {
  patients: RenderedPatient[];
}) {
  return (
    <>
      <FormRow className="mb-4">
        <SearchInput />
      </FormRow>

      <PatientCards patients={patients} className="flex sm:hidden" />
      <PatientsTable patients={patients} />
    </>
  );
}
