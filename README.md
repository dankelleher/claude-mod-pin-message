# pin-message

A Claude Code mod that pins one model message above the prompt.

## What it does

- A 📌 button sits beside every model reply. Press it to pin; press it again to unpin.
- The pin shows in a band above the prompt: `📌 ▸ <10-word summary> ✕`.
- ▸ expands it to the full message (first 12 lines, markdown). ✕ unpins.
- One pin per session. Pinning another reply replaces it.

## Summary

- Shows the first 10 words at once.
- Upgrades to a haiku-written summary of at most 10 words when the model call returns.
- A failed call keeps the first 10 words.

## Notes

- Replies are matched by text, because the transcript site carries no message id.
- The model can read the pin through the `get_pinned_message` tool (`mcp__pin-message__get_pinned_message`, deferred behind ToolSearch).
- Needs no other mod; mods that also draw `AbovePrompt` or `AssistantMessage` stack with it.

## Develop

- `claude --plugin-dir .` loads it.
- `claude plugin validate .` and `claude plugin test .` check it.
