# Sprint Contract: V3.0 - The Subterranean Hope (Catharsis)

## Goal
Execute Sprint 3 of the `/contract-loop`. Modify the backend causal inference prompts and the frontend output rendering to introduce a humanist, positive, and cathartic "Hope Phase" at the end of the deterministic analysis, ensuring users feel liberated from regret rather than crushed by destiny.

## Scope
1. **Backend (`GENERATE_VERDICT.j2`)**:
   - Append `<part_3_the_catharsis>`.
   - The AI must explicitly state that because everything is structurally deterministic, "regret" is illogical. 
   - Inject the humanist undertone: "You are not broken; this pain is a chemical reaction forging your wings (*Let Down*)."
   - End with a prompt to "Immerse your soul in love" (*Street Spirit*).
2. **Frontend (`App.jsx`)**:
   - Restore the original slogan to the footer: `> In math we trust, in causality we find peace.`
   - Ensure the verdict output UI cleanly handles the newly expanded, deeply philosophical responses.

## Explicit Testing Criteria
- [ ] The prompt instructs the LLM to deliver a positive, uplifting conclusion after the cold diagnosis.
- [ ] Radiohead quotes "grow wings/chemical reaction" and "immerse your soul in love" appear in the prompt logic.
- [ ] The footer explicitly contains the restored "In math we trust..." slogan.
