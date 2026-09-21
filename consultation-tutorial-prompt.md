Your task is to create a routes/consultation-tutorial.tsx that walks through a patient showing up at their primary care provider's office and being escalated to a specialist with the backend handling billing seamlessly.

First, read through routes/tutorial and see the existing tutorial that shows a patient arriving at a clinic and being escalated to the senior health care provider at that clinic.

You'll re-use much of that machinery to make a new tutorial experience, but the script and views will differ.

That is:
  Stick to current themes
  All data will live in memory and/or locally (no DB calls should need to be made)
  Generate mock data
  * Patients
  * Doctors
  * Symptoms
  * Referrals
  * Billing codes/prices?

The general script will be as follows

1. Overview + Spiel
  - Lindiwe gives you an overview of the idea of the platform. You'll 

2. Registration (includes insurance)
  - Lindiwe speech bubble says "patients can use the patient app to declare their symptoms ahead of time"
3. Triage 
  - Reuse a lot of the triage explanation, but make this way shorter (pre-filled with the condition and then jump to assign priority page)
3. Consultation
  - Drawer on the right
  - Show that you can click on findings in the drawer and see findings from other public or private facilities
  - Empty state indicates you can add all your findings
4. Referral
  - Show that you can refer within your facility or to a specialist. In the example you create, the patient will have probable hyperparathyroidism condition and thus in the script they will choose to escalate to an Endocrinologist.
5. Billing
  - Show that the procedures are already enumerated and can be sent for approval to the insurer with one click
  - Lindiwe speech bubble says "organization admins can create a fee schedule so that the system can automatically calculate copayments and bill insurers appropriately"

Some components may already exist (namely those arround open encounters + registration + triage + route patient) but nothing does related to billing. At the end, please find attached all our notes related to a fully featured billing component.

Come up with a plan to implement this, and ask any questions you may have regarding how we want to implement this.

~~~

## Billing Notes

In Africa, Most public facilities are still largely cash-based, although many are equipped to process private medical insurance. Billing is typically split into two parts. First, the patient pays a consultation or registration fee at reception to access the clinic and see a clinician. Additional services or procedures performed during the encounter are billed separately.
I imagine we should maintain a billing table where each facility can independently configure and update its own pricing for common ICD-10-coded procedures. Our billing drawer would then automatically populate based on the procedures recorded during the encounter. This allows each facility to decide whether to charge for services such as a point-of-care blood glucose test, wound dressing, injections, prescriptions, or any other billable procedure according to its own pricing schedule.

For insured patients, facilities often require an upfront cash co-payment to maintain cash flow while waiting for insurance claims to be settled. These co-payments are usually collected at reception and can also be configured within the same billing table, since co-payment amounts differ from one facility to another.

Looking ahead, most countries are transitioning towards National Health Insurance (NHI), which functions much like private medical insurance. The clinic submits a claim to the National Health Insurance Agency while collecting any required co-payment upfront. This means the same workflows and billing drawer can be used for private insurance, NHI, and cash-paying patients.

For facilities that are directly subsidized, such as some government and NGO clinics, the solution is straightforward. They would simply zero-rate the relevant procedures in their billing table, allowing the same workflow to operate without generating charges.

From a system design perspective, we therefore need:
• A way to capture a patient's insurance or payment details during registration.
• An administrative interface where each facility can configure prices for selected ICD-10 procedures and co-payments.
• A billing drawer that automatically generates charges based on the procedures recorded during an encounter.
• A provider-facing claim submission workflow.

The remaining design question is whether claim submission should be a two-step process, where the clinician submits the encounter to the accounts department for review before it is sent to the insurer—or whether clinicians should be able to submit claims directly to the health insurance company. Both approaches have merits, and the decision will likely depend on how much financial oversight facilities want before claims are transmitted.
As for pre-authorisations and covered services, the billing table should drive those workflows as well.

For procedures that require pre-authorisation, facility administrators can obtain the relevant lists from each health insurance company and configure them within the billing table. This allows the system to identify which procedures require pre-authorisation and which insurers those rules apply to. While these requirements are often similar across insurers, we should not assume they are identical.

The workflow can then automatically alert providers whenever a recorded procedure requires pre-authorisation or attracts a co-payment.

This also suggests that co-payments should be configured at the procedure level rather than as a single upfront charge collected at reception. Since co-payment requirements can vary by procedure and insurer, a procedure-based approach provides greater accuracy and flexibility while ensuring claims are processed correctly.
So I can imagine giving facility administrators a simple workflow where they can search for and select an ICD-10 procedure, assign a price, automatically check against configured insurance rules to determine whether pre-authorisation is required, and specify whether a co-payment applies. Once saved, the information becomes part of the facility's billing table.

For starters, we can assume that any ICD-10 procedure not configured in the billing table is zero-rated by that health facility.

During an encounter, the billing drawer can then automatically populate based on the procedures recorded by the provider, using the facility's billing table to determine pricing, co-payments, and pre-authorisation requirements. This keeps the billing process consistent while allowing every facility to maintain its own charging policies.
We can also make suggestions of common procedures to make like easier for the Admin as there are thousands of billable ICD-10 procedures though most of them are at tertiary care level. Current practice is to just charge flat fee as consultation, bill things like diagnostics seperately and ask for a Co pay if necessary. Simple but not best practice and we certainly want to take them to international best practises. 
For provider networks, I imagine two common scenarios.

The first is what you might think of as a traditional insurance network, similar to the USA, where a large insurance company owns or contracts with a limited number of primary care clinics and perhaps a hospital in major towns and cities. Those facilities make up the insurer's network.

The second, and probably more common scenario in our markets, is that a single health practice belongs to several insurance networks at the same time. In other words, a patient can walk into almost any participating practice, present their health insurance card, and have their insurance accepted. The practice is credentialed and contracted with multiple insurance companies rather than being exclusive to one.

That means we will likely need to maintain information on which facilities are registered and accredited with each insurance company we onboard. This will allow the platform to validate coverage, determine where claims can be submitted, and ensure providers only bill insurers with whom they have an active agreement.
Then there is the scenario where a patient is covered by more than one health insurance company. In that case, the patient needs to indicate at the start of each visit which insurance policy they want to use for that encounter. This ensures that, once the consultation is complete, the claim is routed to the correct insurer and the appropriate coverage rules, co-payments, and pre-authorisation requirements are applied. 

## Organization View

*Problem you are trying to solve: you have performed various procedures and want to bill the patient’s insurer and get paid for them*

*Problem you are trying to solve: you are planning on performing various procedures and want preapproval to do those procedures (you want to know it’s covered)*

Landing page (by default)

you see a chronological list of patients seen at your organization

For each you see the procedures done 

Diagnosis done

Surgery done

Medicine Prescribed

Prepare invoice as pdf

Claim status: Nothing Sent to Insurer, Sent to Insurer, Rejected, Accepted, Paid

I can manually set the status

For insurers who have partnered with VHA, this process can all take place through the app

## Insurer View

Flipside of this: claims come in, you can reject them, accept, them, pay them out and/or ask questions of the practitioner

- Click the patient to get more details
- medications

### Claims & Billing Module — Product Design Brief

## Goal

Design a flexible billing and insurance claims module that works across cash-paying patients, private medical insurance, and future National Health Insurance (NHI) schemes without requiring different workflows for each.

The objective is to create a workflow that can adapt to the way different facilities and insurers operate while remaining simple for clinicians and administrators.

---

# Core Design Principles

- One billing workflow for all payment models.
- Every health facility controls its own pricing.
- Insurance-specific rules should be configurable rather than hard-coded.
- The billing experience should require as little manual work as possible.
- Billing should be generated automatically from the clinical encounter.

---

# Patient Registration

At registration, staff should be able to capture:

- Payment method (Cash, Insurance, NHI, NGO-sponsored, etc.)
- Insurance company
- Membership number
- Expiry Date
- Dependants
- Multiple insurance policies
- Which insurance policy will be used for this visit

A patient may have more than one insurance policy, so the system should allow them to select the one they wish to use for the current encounter.

---

# Facility Billing Configuration

Each facility should maintain its own billing table.

Rather than hard-coding prices, administrators should be able to configure:

- Billable procedures (Search and add from ICD-10 list)
- Consultation fees
- Procedure prices
- Co-payments for both consultation and procedures
- Procedures requiring pre-authorisation
- Applicable insurers

To make setup easier, the system should suggest commonly used procedures while still allowing facilities to configure additional ones.

If a procedure has not been configured, we can initially assume it is zero-rated by that facility.

---

# Billing During the Encounter

As clinicians record procedures during the consultation, the billing drawer should populate automatically.

Items may include:

- Consultation
- Procedures
- Diagnostics
- Medications
- Consumables
- Co-payments
- Discounts
- Total amount due

The clinician should not need to manually prepare the invoice.

---

# Insurance Rules

Different insurers have different requirements.

The billing configuration should allow facilities to define:

- Covered procedures
- Procedures requiring pre-authorisation
- Co-payment rules
- Insurer-specific pricing where necessary

When a clinician records a procedure, the system should automatically indicate whether:

- Pre-authorisation is required
- A co-payment applies
- The procedure is billable

---

# Claims Submission

Once an encounter is complete, the system should generate a claim automatically.

We need to support two possible workflows:

**Option 1**

Clinician → Accounts Department → Insurance Company

This allows finance staff to review claims before submission.

**Option 2**

Clinician → Insurance Company

Facilities with simpler workflows may allow clinicians to submit claims directly.

This should ideally be configurable per organisation.

---

# Provider Networks

The platform should support two common scenarios.

### Traditional Networks

Some insurers have a defined network of contracted clinics and hospitals.

Only these providers can submit claims.

### Multi-Network Providers

More commonly, a clinic is contracted with several insurers simultaneously.

Patients present whichever insurance they wish to use, and the claim is submitted to that insurer.

The platform therefore needs to know which facilities are accredited by which insurers.

---

# Public Sector

The same workflow should also work for government-funded facilities.

Facilities that do not charge patients can simply configure consultation fees and procedures as zero-rated while still recording all services provided.

This allows the same clinical and billing workflow to work for:

- Cash-paying patients
- Private insurance
- National Health Insurance
- Government-funded facilities
- NGO-funded facilities

---

# Organization Dashboard

The landing page should display a chronological list of patient encounters.

For each encounter users should be able to see:

- Diagnoses
- Procedures performed
- Medications prescribed
- Invoice
- Claim status

Suggested claim statuses:

- Draft
- Ready for Review
- Submitted
- Rejected
- Accepted
- Paid

Initially these statuses can be updated manually. For insurers integrated with VHA, status updates should eventually happen automatically.

---

# Insurer Portal

The insurer experience is the opposite side of the workflow.

Claims should be reviewable with access to:

- Patient details
- Clinical notes
- Diagnoses
- Procedures
- Medications
- Billing summary
- Supporting documents

Insurers should be able to:

- Approve claims
- Reject claims
- Request additional information
- Record payment
- Track claim history

---

# Open Design Questions

These are the key UX questions we'd like to explore during design:

- How should administrators configure billing without overwhelming them?
- What is the simplest way for clinicians to understand when pre-authorisation or co-payment is required?
- Should claims always pass through an accounts review, or should this be configurable?
- How can the billing drawer remain largely automatic while still allowing manual adjustments when needed?
- What is the best way to surface claim status to both providers and insurers?
- How should insurer integrations fit into the workflow without changing the user experience?