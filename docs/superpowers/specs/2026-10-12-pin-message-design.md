# pin-message: design

## Purpose

A mod that lets the person pin one model message so it stays in view while the chat moves on.

## Behaviour

- Every model-generated transcript block gets a 📌 button. Pressing it pins that block; pressing the pinned block's button unpins it.
- One pin per session. Pinning another block replaces the pin.
- The pin shows in a band above the prompt (`AbovePrompt`), the nearest site the mod API offers to the top of the chat.
  - Collapsed: `📌 <summary of about 10 words>`, an expand button and an unpin button.
  - Expanded: the full text as markdown, capped at 12 lines, an collapse button and an unpin button.
- The summary is the first 10 words at pin time, replaced by a `$.model.complete` summary (haiku alias, 10 words max) when it returns. A failed call keeps the first 10 words.

## Design

- `types/index.d.ts` declares `$.state['pin-message'].pin`.
- `hooks/summary.ts`: pure helpers (`firstWords`, `summaryPrompt`, `cleanSummary`, `clip`).
- `hooks/register.tsx`: `ui.render` on `AssistantMessage` wraps the engine's row (`next(e)`) with the button; `ui.render` on `AbovePrompt` draws the band, calling `next(e)` when there is no pin so other mods keep their place.
- A pin is identified by its text: `AssistantMessage` props carry no message id.
- Depends on no other mod; it only wraps `next`.

## Testing

`claude plugin test` on terminal and desktop: pin, unpin, replace, expand/collapse, summary success and failure, ignored summary rows. Plus `claude plugin validate` and `tsc`.
