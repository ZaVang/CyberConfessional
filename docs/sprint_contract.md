# Sprint Contract: V2.0 P2 - Onboarding & Audio Atmosphere

## Goal
Execute Iteration 2 of the CyberConfessional v2.0 update. This sprint focuses on the entry flows and sensory feedback to finalize the Radiohead aesthetic.

## Scope
1. **CyberLogin.jsx Refactor**:
   - Replace the welcoming "priest" text with cold terminal inputs (`> SYSTEM_ENTRY: Insert anomalous subject UID`).
   - Remove cyan borders/glows and replace with neutral grays and terminal greens.
2. **CyberOnboarding.jsx Refactor**:
   - Implement the "Fade Out" (*Street Spirit*) mechanic: Slow UI transitions, removing control, and fading into pure black/grey.
   - Replace the final calibration screen text (`System.Soul_Anchoring...`) with `> Everything in its right place.`
3. **Background Audio (Idioteque Synth/Noise)**:
   - Create a Web Audio API hook or component (`BackgroundAudio.jsx`) to synthesize a faint, cold, nervous synthesizer noise (sine/square wave + low-pass filter) and deep sea rumble (pink noise), played only after the first user interaction (login).

## Explicit Testing Criteria
- [ ] Login screen contains no warm language and uses terminal syntax.
- [ ] Onboarding questions trigger the slow fade out (sink) effect as desired.
- [ ] The app procedurally generates faint audio drones/noise upon entering the app, avoiding autoplay policies by initiating upon login click.
