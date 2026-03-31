# CyberConfessional V4.0 Product Spec (Iteration 2: The Neural Terminal)
**Date:** 2026-03-31
**Based on:** Autonomous Internal User Persona Simulation

## 1. Product Awareness & User Critique (Self-Assessment)
**Persona:** A stressed user at 3 AM, hands trembling, typing a dark confession into the system.
**Critique:** I appreciate the "Exhale" transition when I finally receive liberation. However, *before* I get there, the act of typing my confession feels too much like leaving a comment on a blog. I am interfacing with the Karma Police; the terminal should feel alive, reactive, and slightly antagonistic or unstable. When I type, the characters should bleed into the digital ether. It needs to feel like a "Neural Uplink."

## 2. Iterative Optimization Plan (Feature Breakdown)
### Feature 2: Kinetic Confessional Input (The Neural Terminal)
- **Goal:** Make the act of typing a confession deeply immersive and physically reactive.
- **Execution:** 
  - Change the default boring typing cursor to a solid terminal block (Caret).
  - Implement a kinetic keystroke feedback loop: As the user types, the input box goes into an `isTyping` state.
  - While typing, the text should emit a chromatic "glitch" shadow (cyan/red split) and experience micro-vibrations, symbolizing the "anomaly" being injected into the system.
  - If the application is in the post-confession `<catharsis>` state and they decide to type again, the glitch should be replaced by a soft, warm breathing pulse instead of a harsh chromatic aberration.
