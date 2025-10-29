#!/usr/bin/env bash
set -euo pipefail


files=(
  components/calendar/ScheduleForm.tsx
  components/health_worker/EmployeesTable.tsx
  components/health_worker/nurse/invite/NursePersonalForm.tsx
  components/health_worker/nurse/invite/NurseProfessionalForm.tsx
  components/inventory/DeviceForm.tsx
  components/library/ContactForm.tsx
  components/library/ContactPage.tsx
  components/patient-registration/AddressSection.tsx
  components/patient-registration/AddressSectionUsingCountryAddressTree.tsx
  components/patient-registration/ThisVisitSection.tsx
  components/patients/View.tsx
  components/regulator/InvitePharmacistForm.tsx
  components/regulator/MedicinesSearch.tsx
  components/vitals/VitalInputWithEvaluation.tsx
  components/vitals/VitalsMeasurementsInput.tsx
  islands/diagnoses/Form.tsx
  islands/examinations/ChecklistItem.tsx
  islands/examinations/Dialog.tsx
  islands/patient-registration/PersonalSection.tsx
  routes/apply.tsx
  routes/partner.tsx
  routes/schedule-demo.tsx
  routes/regulator/[country]/pharmacies.tsx
  routes/regulator/[country]/pharmacists.tsx
)

for file in "${files[@]}"; do
  code --wait "$file" --command "editor.action.sourceAction" --args '{"kind":"source.addMissingImports","apply":"first"}'
done

const vscode = require('vscode');
const path = require('path');

const files = [
  'components/calendar/ScheduleForm.tsx',
  'components/health_worker/EmployeesTable.tsx',
  'components/health_worker/nurse/invite/NursePersonalForm.tsx',
  // ... rest of your files
];

async function addImports() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    console.error('No workspace folder found');
    return;
  }

  for (const file of files) {
    const filePath = path.join(workspaceFolder.uri.fsPath, file);
    const uri = vscode.Uri.file(filePath);
    
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc, { preview: false });
      
      await vscode.commands.executeCommand('editor.action.sourceAction', {
        kind: 'source.addMissingImports',
        apply: 'first'
      });
      
      await doc.save();
      console.log(`✓ Processed: ${file}`);
    } catch (error) {
      console.error(`✗ Failed: ${file}`, error.message);
    }
  }
  
  console.log('Done!');
}

addImports();