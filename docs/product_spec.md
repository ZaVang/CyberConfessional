# CyberConfessional V3: The Resonance Protocol
**Date:** March 2026
**Subject:** High-Level Product Architecture (Planner Phase)
**Theme:** moving from "Individual Catharsis" to "Collective Witnessing" and "Architectural Decay".

## 1. Product Philosophy & Core Identity
CyberConfessional V3 reinforces the Radiohead aesthetic—cold, deterministic, glitchy, and deeply fatalistic. Instead of building a bustling social network, the evolution pushes towards a "Digital Sanctuary" where users exist as isolated nodes in a grand Causal Network. 

Key themes:
*   **The Dehumanization of Regret:** Emotional distress is treated mathematically as an "entropy injection" or a "causal bug report."
*   **Temporal Inevitability:** The past is unchangeable because it is the structural pillar holding up the future.
*   **Passive Witnessing:** Social interaction exists only as anonymous "Background Radiation" and corrupted signal data.

---

## 2. Feature Requirements

### Feature 1: The Shadow of Tomorrow (明日之影) - *Optional Input*
*   **Concept:** Regret implies a disconnected past and future. We bridge them.
*   **User Flow:** During the confession input phase, users are asked for their past regret (mandatory) and are given an *optional* input to state an "Aspiration for the Future" (e.g., "I just want to be debt-free").
*   **LLM Logic (The Temporal Weaver):** If the future aspiration is provided, the Priest's verdict must contain a "Temporal Loop" argument. It mathematically "proves" why the user's past failure $X$ was an absolute boundary condition required for that future aspiration to even exist. (e.g., "If you didn't fail today, your ego would prevent you from reaching the humility required for your future wish.")

### Feature 2: The Black Box Archive (黑匣子日志)
*   **Concept:** Past logs should not be presented like friendly chat history. They are the "Flight Data" of a crashed world-line.
*   **User Flow:** A new section in the `UserDashboard` for users to view all their past Confessions.
*   **Display:** Logs are listed with cold hex codes (e.g., `LOG-0x8F9A`). Clicking one reveals the original prompt and the Priest's verdict using a "Decryption / Glitch" typewriter animation.

### Feature 3: Causal Half-Life & Entropy Wash (因果衰变)
*   **Concept:** The human brain forgets to stay sane. The machine must also undergo "Entropy Wash" to keep the Causal Graph (DAG) readable.
*   **User Flow:** In the `KarmaNetwork3D` view, as users accumulate nodes over many confessions, the graph becomes cluttered.
*   **Execution:** 
    *   **Auto-Decay:** Nodes that have `trigger_count == 1` or haven't been triggered recently visually fade out (opacity decreases) and shrink. Frequently hit nodes (e.g., repeating the same mistake) become "Gravity Wells" (larger spheres).
    *   **Manual Control:** A slider on the UI `[ NOISE CANCELLATION ]`. Dragging it filters out low-frequency nodes, instantly simplifying the tragic architecture of the user's life.

### Feature 4: The Void Explorer & Resonance Signaling (虚空共振)
*   **Concept:** Seeing that others are trapped in the same algorithm provides cold comfort.
*   **User Flow:** An "Anonymized Sea of Destiny" where users can browse others' finalized verdicts (Receipts).
*   **Interaction:** No text comments allowed. Users can only click a button that sends a "Resonance Signal" (Harmonic Distortion). When the author logs in next time, they see a visual glitch and a notification: *"External Interference Detected: A stranger's entropy has merged with yours."*

---

## 3. Engineering Constraints (Evaluator Context)
*   **Performance:** Canvas/3D and complex CSS filters must not degrade performance. We need to maintain simple geometries in `react-force-graph-3d`.
*   **Data Integrity:** The Black Box requires we correctly deserialize history and verdicts from the database without losing the formatting.
