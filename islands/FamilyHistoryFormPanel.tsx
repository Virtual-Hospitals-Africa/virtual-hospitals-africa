import { Dialog, Transition } from "@headlessui/react";
import { Signal, useSignal } from "@preact/signals";
import { Fragment } from "preact";
import { Button } from "../components/library/Button.tsx";
import Form from "../components/library/Form.tsx";
import { HiddenInput } from "../components/library/HiddenInput.tsx";
import { XMarkIcon } from "../components/library/icons/heroicons/solid.tsx";
import { AddRow } from "./AddRemove.tsx";
import RelationshipSelect from "./family/RelationshipSelect.tsx";

type Condition = { name: string; id: string };
type FamilyHistoryFormPanelProps = {
  condition: Signal<null | Condition>;
};

function FamilyHistoryForm({ condition }: FamilyHistoryFormPanelProps) {
  console.log(condition);
  const familyMembers = useSignal<
    {
      relationship_gendered: undefined | string;
    }[]
  >([{ relationship_gendered: undefined }]);
  const addFamilyMember = () => {
    familyMembers.value = [
      ...familyMembers.value,
      { relationship_gendered: undefined },
    ];
  };

  return (
    <Form method="POST">
      <HiddenInput
        name="family_history.snomed_concept_id"
        value={condition.value?.id}
      />
      {familyMembers.value.map((member, index) => (
        <FamilyMemberSection member={member} index={index} />
      ))}
      <AddRow
        text="Add New Family Member For Condition"
        onClick={addFamilyMember}
      />
      <Button
        type="button"
        onClick={() => (condition.value = null)}
        variant="outline"
        className="mt-10"
      >
        Cancel
      </Button>
      <Button>Save</Button>
    </Form>
  );
}

function FamilyMemberSection({
  member,
  index,
}: {
  member: any;
  index: number;
}) {
  return (
    <>
      <RelationshipSelect
        required
        name={`family_history.family_members.${index}.relation_gendered`}
        family_relation_gendered={undefined}
        type="all"
        gender={undefined}
      />
      {/* <Gender
        required
        name={`family_members.${index}.family_relation_gendered`}
        family_relation_gendered={undefined}
        type="all"
        gender={undefined}
      />
      <Notes
        required
        name={`family_members.${index}.family_relation_gendered`}
        family_relation_gendered={undefined}
        type="all"
        gender={undefined}
      /> */}
    </>
  );
}

// const newFamilyMember = {
//   comorbidities: [],
//   medications: [],
//   start_date:
//     props.earliestSymptomDate || new Date().toISOString().split("T")[0], // default to earliest date or today
// };
//   return ()
// }

export function FamilyHistoryFormPanel({
  condition,
}: FamilyHistoryFormPanelProps) {
  return (
    <Transition.Root show={!!condition.value} as={Fragment}>
      <Dialog onClose={() => null} className="relative z-10">
        {/* <Dialog.Backdrop
          transition
          className="fixed inset-0 bg-gray-900/50 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
        /> */}

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Dialog.Panel
                // transition -- This messes things up
                className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <Transition.Child as={Fragment}>
                  <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 duration-500 ease-in-out data-closed:opacity-0 sm:-ml-10 sm:pr-4">
                    <button
                      type="button"
                      onClick={() => (condition.value = null)}
                      className="relative rounded-md text-gray-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                      <span className="absolute -inset-2.5" />
                      <span className="sr-only">Close panel</span>
                      <XMarkIcon aria-hidden="true" className="size-6" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-white/10">
                  <div className="px-4 sm:px-6">
                    <Dialog.Title className="text-base font-semibold text-white">
                      Panel title
                    </Dialog.Title>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    {/* Family members loop through them */}
                    <FamilyHistoryForm condition={condition} />
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
