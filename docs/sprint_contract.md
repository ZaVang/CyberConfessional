# Sprint Contract: Consent Workflow & Seeding (Sprint 6)
**Date:** 2026-03-31
**Target:** Sprint 6

## What are we building right now?
A frontend intercept mechanism for casting receipts (providing explicit user consent regarding anonymity), and a backend scripting utility to retroactively seed the Void Sea using existing database logs.

## Implementation Details (Strict API)
1.  **Consent UI (`frontend/src/components/VoidReceipt.jsx`):**
    *   Change the `castStatus` state logic. Introduce a new state `showConsent` (boolean, default false).
    *   Clicking `CAST ANONYMOUSLY INTO VOID` sets `showConsent = true`.
    *   When true, the right-side button panel is replaced by a warning box with two actions: `[ PROCEED TO CAST ]` and `[ CANCEL ]`.
    *   `[ PROCEED TO CAST ]` triggers the actual API payload submission.
2.  **Data Hydration Script (`backend/scripts/seed_sea.py`):**
    *   Initialize SQLModel Session connected to `sqlite:///cyber_priest.db`.
    *   Select all `ConfessionLog` rows.
    *   For each row, create a `VoidReceiptLog` mapping `content` -> `confession_text`, `counterfactual_prob` -> `prob_score`. If the verdict text contains `<catharsis>`, set `is_catharsis = True`. Use fallback defaults for `z_val` and `m_bias`.
    *   Commit to database.

## EXACT Testing Criteria (Acceptance Criteria)
1. **Double Opt-In:** The user cannot cast an anomaly without clicking exactly two affirmative buttons outlining the anonymity rules.
2. **Hydration Success:** Running the python script successfully populates `VoidReceiptLog` without crashing or violating DB constraints, and reloading the frontend Altar visibly shows these seeded receipts drifting.
