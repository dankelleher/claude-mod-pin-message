# pin-message

A Claude Code mod that pins one model message above the prompt.

![Pinning one of three similar ticket tables, opening and closing the pin, asking about "my pinned message", then having Claude pin a new message](docs/demo/pin.gif)

## Install

```
/plugin install pin-message --marketplace dankelleher/claude-mod-pin-message
```

Answer `y` to add the marketplace, then pick a scope. It is active at once.

## What it does

- A 📌 button sits beside every model reply. Press it to pin; press it again to unpin.
- The pin shows in a band above the prompt: `📌 ▸ <10-word summary> ✕`.
- ▸ expands it to the full message (first 12 lines, markdown). ✕ unpins.
- One pin per session. Pinning another reply replaces it.

## Summary

- Shows the first 10 words at once.
- Upgrades to a haiku-written summary of at most 10 words when the model call returns.
- A failed call keeps the first 10 words.

## Tools for the model

- `get_pinned_message`: returns the pinned text and summary. "My pinned message" is then unambiguous even when several similar replies sit in the chat.
- `pin_message`: pins the given `text`, or Claude's latest reply when `text` is left out. "List the tickets and pin it" works.
- `unpin_message`: clears the pin.
- All three are deferred behind ToolSearch (`mcp__pin-message__<name>`), so they add nothing to a request until Claude looks one up.

## Notes

- Replies are matched by text, because the transcript site carries no message id.
- Needs no other mod; mods that also draw `AbovePrompt` or `AssistantMessage` stack with it.

## Develop

- `claude --plugin-dir .` loads it.
- `claude plugin validate .` and `claude plugin test .` check it.
