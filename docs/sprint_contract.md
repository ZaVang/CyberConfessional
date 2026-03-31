# Sprint Contract: The Neural Terminal (Sprint 2)
**Date:** 2026-03-31
**Target:** Sprint 2 (Self-Approved Execution)

## What are we building right now?
We are implementing **Kinetic Confessional Input** to make the act of typing a dark secret feel like interfacing with a volatile "Karma Police" mainframe.
Currently, typing feels like standard HTML. We will introduce a reactive CSS and React state combination that causes the text to "glitch" or "pulsate" upon keystrokes.

## Implementation Details (Strict API)
1. **State Management (`App.jsx`):** 
    *   Introduce `isTyping` state hook.
    *   Introduce `typingTimeoutRef` using `useRef`.
    *   On the `<textarea>`'s `onChange`, set `isTyping(true)` and establish a 150ms timeout to set it to `false`. This creates an active debounce window that keeps the input in a "kinetic" state while keys are pressed.
    *   Append a `kinetic-active` class to the textarea conditionally based on `isTyping`.
2. **CSS Overhaul (`App.css`):**
    *   Update `.neon-input` to use a thick `caret-color: var(--accent-red)`. If `.catharsis-mode` applies, change it to `#ffd700`.
    *   Define `.kinetic-active` class: applies an aggressive text-shadow (cyan/red chromatic split) and attaches the `typeGlitch` keyframes animation.
    *   If `.catharsis-mode` applies, redefine `.kinetic-active` to attach a soft `typeBreathe` animation with a warm, blooming shadow (so it doesn't fight the newfound peace).
    *   Create `@keyframes typeGlitch` mapping micro-translations and hue rotations simulating signal instability.
    *   Create `@keyframes typeBreathe` with subtle scaling (`scale(1.002)`).

## EXACT Testing Criteria (Acceptance Criteria - Evaluated Autonomously)
1. **Typing Trigger**: The CSS glitch properties only activate when keys are being rapidly pressed (`isTyping` true) and quickly disappear when the user stops.
2. **Contextual Theming**: The typing feedback correctly maps to current context—aggressive instability for dark confession mode, soft breathing pulse for catharsis mode.
3. **No Memory Leaks**: Timeout is properly cleared if the user keeps typing fast, ensuring DOM doesn't get flooded with pending state resets.
