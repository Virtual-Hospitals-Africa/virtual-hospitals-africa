import { useSignal } from "@preact/signals";
import { EmptyState } from "../components/library/EmptyState.tsx";
import AsyncSearch from "./AsyncSearch.tsx";
import { FamilyHistoryFormPanel } from './FamilyHistoryFormPanel.tsx'

export function FamilyHistoryPage() {
  const condition = useSignal<null | { id: string; name: string }>(null);

  return (
    <>
      <AsyncSearch
        search_route="/app/conditions"
        onSelect={(option: any) => (condition.value = option)}
      />
      <EmptyState
        header="No family history added yet"
        explanation="Search for conditions or select from the suggestions above to add to the patient's family history."
      />

      {/* DRAWER */}
      <FamilyHistoryFormPanel condition={condition}/>
    </>
  );
}
