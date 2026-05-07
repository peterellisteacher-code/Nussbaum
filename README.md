# Emotional Knowledge — Martha Nussbaum

Stage 2 Philosophy interactive learning site. Six levels working through Nussbaum's epistemology of emotion in dialogue with Plato, Hume, and Haidt — with a Socratic AI tutor in a right-side panel that adjusts its framing per level.

## How to run

1. **Set your Anthropic API key** (Windows PowerShell):
   ```
   $env:ANTHROPIC_API_KEY = "sk-ant-..."
   ```
2. **Start the server**:
   ```
   npm start
   ```
3. Open http://localhost:3000

## What's here

- **6 levels**, each with a different activity drawn from the make-learning-game playbook bank:
  1. *The Rationalist Challenge* (Plato) — claim classifier
  2. *Hume's Empiricist Twist* — three-zone sort
  3. *Nussbaum's Core Claim* (emotion-cognitions) — argument builder
  4. *Narrative Imagination* (Henry James / moral perception) — two-path scenario
  5. *Haidt's Empirical Floor* (composite picture) — claim matcher
  6. *The Live Objection* (Plato returns + JTB synthesis) — dialectical exchange + writing
- **Socratic right-side panel** — Anthropic API with prompt caching of all Nussbaum readings; level-aware context so the tutor's framing shifts as students progress.
- **fal.ai graphics** — six commissioned illustrations (deep navy / warm amber palette) in `images/`.

## Pedagogy notes (for Peter)

- Frame is consistently **epistemological** (knowledge / justification / reliability), never ethical / moral-formation. The system prompt enforces this.
- **Haidt is the empirical floor** — all materials treat him as composite with Nussbaum, never opposed. Slide 5 makes this explicit with a "Critical framing note" callout.
- **Plato is the live objection at Levels 1 and 6** — Level 1 sets up his case, Level 6 returns to it for synthesis.
- **AI probes** in every level — preserves the unit's running thread without resolving it.
- **Essay alignment** — every activity ties back to Prompts 1, 2, or 3 of Issues Analysis 1.

## Files

- `index.html` — single-file site, all CSS/JS embedded
- `server.js` — Node.js Express backend with Anthropic SDK + prompt caching
- `package.json` — dependencies
- `images/` — six fal.ai-generated illustrations

## Accessibility

Verified via `html-verifier` against `accessible-web-composition` skill. WCAG 2.2 AA compliant:
- Single H1 per page state, semantic headings throughout
- All interactive controls are real `<button>` / `<textarea>` (no div-onclick)
- Keyboard navigation across all activities (click-to-select pattern works with mouse and keyboard equally)
- Live region (`aria-live="polite"` + `role="log"`) on chat messages, focusable scrollable region (tabindex="0")
- 14:1 contrast on level badges, 13:1 on send button
- Mobile reflow at <900px (panel stacks below content); single-column at 320px
- `prefers-reduced-motion` honoured
