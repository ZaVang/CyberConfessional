# CyberConfessional V4.0 Product Spec (Iteration 5: Consent & Seeding)
**Date:** 2026-03-31
**Based on:** User request for explicit anonymity consent and data seeding for testing.

## 1. Product Awareness & User Critique
**Target Audience:** Users anxious about privacy but wanting to participate in the Void Sea.
**Critique on Current Workflow:** Currently, clicking "CAST ANONYMOUSLY" immediately uploads the data. There is no explicit confirmation summarizing what will happen, which might violate privacy expectations or leave users confused about what "The Void" actually is. Furthermore, new users (or testers) cannot see the visual impact of the Void Sea if there are no historical receipts drifting.
**Feature Proposal:** 
1. **Explicit Consent Modal:** When casting, pop up a definitive alert clarifying the anonymity and global visibility of the action.
2. **Historical Seeding:** A utility script to retrospectively convert all private `ConfessionLog` entries in the user's local database into anonymized `VoidReceiptLog` entries to kickstart the visual "Sea" engine for testing.

## 2. Iterative Optimization Plan
### Feature 7: Privacy Consent Workflow & Data Hydration
- **Goal:** Ensure user trust via explicit confirmation and hydrate the local test environment with drifting receipts.
- **Execution:**
  1. **Frontend Interaction:** Modify `<VoidReceipt>` to intercept the cast button click. Transition to a "Consent State" displaying a warning: "WARNING: Your anomaly will be stripped of identity and drift infinitely on the global Altar. Do you accept this exposure?"
  2. **Data Hydration (Seeding):** Write a standalone Python script `backend/scripts/seed_sea.py` that queries all existing `ConfessionLog` entries, strips user associations, defaults mathematical variables where missing, and populates `VoidReceiptLog`.
