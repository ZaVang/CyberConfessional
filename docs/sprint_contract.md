# Sprint Contract: V3 Resonance & Archive
**Execution Phase:** Generator (Next Step)

This document is the rigid specification for the Generator Phase. The Evaluator will use these exact criteria to judge the output.

## 1. Feature: The Shadow of Tomorrow (Future Aspiration)
**Status:** REQUIRED (Architectural Addition)
*   **UI Update (`CyberOnboarding.jsx` / `CyberLogin.jsx`):** The confession form must be split or augmented to accept `future_aspiration` as an **Optional** field. It should be styled cold and dehumanized (e.g., "Declare a required future state").
*   **API Update (`POST /generate_verdict`):** Accept `future_aspiration: Optional[str]`.
*   **Prompt Update:** If `future_aspiration` is present, prompt the LLM to structurally prove that the past regret is a mandatory boundary condition for this future aspiration. The tone must remain mathematical and fatalistic (Radiohead aesthetic).

## 2. Feature: The Black Box Archive (History Persistence)
**Status:** REQUIRED (New Endpoint & Component)
*   **API Update (`GET /api/users/{user_id}/logs`):** A new endpoint returning a list of `ConfessionLog` objects. Must return `id`, `created_at`, `content` (the prompt), and `verdict_text` (the LLM output).
*   **UI Update (`UserDashboard.jsx`):** Add an "ARCHIVES" tab or container.
*   **Component (`ConfessionArchive.jsx`):** A new component that renders the list of logs. Dates formatted as `HEX` timestamps or cold terminals.
*   **Interaction:** Clicking a log triggers a typewriter decryption effect revealing the text.

## 3. Feature: Causal Half-Life (Graph Simplification)
**Status:** REQUIRED (Data Viz Modification)
*   **API Update (`GET /api/users/{user_id}/graph`):** Ensure `trigger_count` and `last_triggered_at` are provided for all nodes.
*   **Component Update (`KarmaNetwork3D.jsx`):**
    *   **Decay Logic:** Nodes with `trigger_count == 1` should be physically smaller and have an opacity `< 1` (e.g., 0.4). Nodes with `trigger_count > 1` are "Gravity Wells" (size multiplier = `trigger_count * 1.5`, max threshold).
    *   **Noise Filter:** A range slider that filters out nodes based on `trigger_count` or age. If slider is shifted, low-tier nodes are removed from the `processedData` sent to `react-force-graph-3d`.

## 4. Evaluator Acceptance Criteria
1.  Can a user submit a confession *with* a future aspiration, and does the UI pass it to the backend?
2.  Does the dashboard successfully call `GET /api/users/{user_id}/logs` and display previous sessions?
3.  Does the 3D Graph visually distinguish between single-use nodes and frequent nodes? Does the `NOISE CANCELLATION` slider successfully hide the weak nodes?
