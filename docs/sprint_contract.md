# Sprint Contract: The Void Receipt (Sprint 4)
**Date:** 2026-03-31
**Target:** Sprint 4

## What are we building right now?
A completely new viral interaction mechanic: **The Void Receipt (Karma Ticket)**.
We are adding a UI button in the verdict container that, when clicked, renders a stylized thermal-receipt artifact overlay showing the user's "Cosmic Transaction" details. It also allows them to copy a brutalist ASCII version to their clipboard.

## Implementation Details (Strict API)
1.  **Component Creation (`frontend/src/components/VoidReceipt.jsx`):**
    *   Accepts props: `result` (the verdict data), `confession` (the user's text), `zVal`, `mBias`, and `onClose`.
    *   DOM structure mimics a tall thermal paper receipt using Tailwind (bg-white or off-white, black monospace text, dashed borders).
    *   Includes a generated `<pre>` barcode using simple box-drawing characters (`█ ▄ █ █ ▀`).
2.  **App Integration (`frontend/src/App.jsx`):**
    *   Add a new state: `const [showReceipt, setShowReceipt] = useState(false);`
    *   Add a button next to "EXTRACT CAUSAL DATA": `[ PRINT VOID RECEIPT ]`.
    *   When clicked, conditionally render `<VoidReceipt ... />` as a fixed modal layer with a high z-index.
3.  **ASCII Copy Mechanic:**
    *   Inside `<VoidReceipt>`, a button "COPY TO CLIPBOARD" that concatenates the data into a pure `.txt` format and calls `navigator.clipboard.writeText(...)`.
    *   Format: `> CYBER_CONFESSIONAL_RECEIPT \n> Anomaly: [Text] \n> Latent U: [X] \n> ... \n> NO REFUNDS ON DESTINY.`

## EXACT Testing Criteria (Acceptance Criteria)
1. **Trigger:** The "PRINT VOID RECEIPT" button only appears after a verdict is successfully generated.
2. **Rendering:** The `VoidReceipt` modal renders above all other elements (`z-index`) and has a distinct light/thermal-paper aesthetic that contrasts hilariously with the dark app.
3. **Data Binding:** The receipt accurately reflects the `confession`, `zVal`, `mBias`, and `result` causal variables.
4. **Copy Action:** Clicking copy correctly writes the formatted ASCII string to the system clipboard without crashing.
