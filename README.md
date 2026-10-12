# pin-message

A Claude Code mod that pins one model message above the prompt.

![Pinning a reply: the 📌 button, the one-line summary above the prompt, expanding and unpinning](docs/demo/pin.gif)

The recording is `docs/demo/pin.cast`; play it with `asciinema play docs/demo/pin.cast`.

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

## Notes

- Replies are matched by text, because the transcript site carries no message id.
- The model can read the pin through the `get_pinned_message` tool (`mcp__pin-message__get_pinned_message`, deferred behind ToolSearch).
- Needs no other mod; mods that also draw `AbovePrompt` or `AssistantMessage` stack with it.

## Develop

- `claude --plugin-dir .` loads it.
- `claude plugin validate .` and `claude plugin test .` check it.
