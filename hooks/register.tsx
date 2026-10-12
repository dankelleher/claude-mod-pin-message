import { atom, read, update } from 'claude-code'
import type { Engine, Register } from 'claude-code'

import type { Pin } from '../types'
import { cleanSummary, clip, firstWords, summaryPrompt } from './summary'

const pin = atom({ plugin: 'pin-message', key: 'pin' } as const, null)

const TOOL = 'mcp__pin-message__'

async function pinText($: Engine, text: string): Promise<void> {
  const fresh: Pin = { text, summary: firstWords(text), isExpanded: false }
  await update($, pin, () => fresh)

  const result = await $.model.complete({ model: 'haiku', prompt: summaryPrompt(text) })
  const summary = result.isAnswered ? cleanSummary(result.text) : ''

  if (summary !== '') {
    await update($, pin, now => (now?.text === text ? { ...now, summary } : now))
  }
}

async function latestReply($: Engine): Promise<string> {
  const messages = await $.session.messages()
  const reply = messages.filter(m => m.role === 'assistant' && m.text.trim() !== '').at(-1)

  return reply?.text.trim() ?? ''
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: 'get_pinned_message',
      description:
        'Returns the message the person pinned above their prompt, as its full text and short summary, or says none is pinned. Call it whenever they refer to "the pinned message" or "what I pinned": it is the only way to tell which message they pinned when several similar ones exist.',
    })
    await $.tool.register({
      name: 'pin_message',
      description:
        'Pins a message above the person\'s prompt, replacing any earlier pin. Pass `text` to pin that text, or leave it out to pin your most recent reply. Call it when they ask you to pin something ("list them and pin it").',
      inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
    })
    await $.tool.register({
      name: 'unpin_message',
      description: 'Removes the pinned message, if any.',
    })

    return next(e)
  })

  on('tool.call', { tool: `${TOOL}get_pinned_message` }, async $ => {
    const current = await read($, pin)

    return {
      result: current ? `Summary: ${current.summary}\n\n${current.text}` : 'Nothing is pinned.',
    }
  })

  on('tool.call', { tool: `${TOOL}pin_message` }, async ($, e) => {
    const given = typeof e.text === 'string' ? e.text.trim() : ''
    const text = given !== '' ? given : await latestReply($)

    if (text === '') {
      return { result: 'There is no reply to pin yet.' }
    }

    await pinText($, text)

    return { result: 'Pinned.' }
  })

  on('tool.call', { tool: `${TOOL}unpin_message` }, async $ => {
    await update($, pin, () => null)

    return { result: 'Unpinned.' }
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const row = await next(e)
    const text = e.props.text.trim()

    if (e.props.isSummary || text === '') {
      return row
    }

    const { Box, Button } = $.ui.resolve(e)
    const current = await read($, pin)
    const isPinned = current?.text === text

    const toggle = () => (isPinned ? update($, pin, () => null) : pinText($, text))

    return (
      <Box>
        <Box flexGrow={1}>{row}</Box>
        <Button key="pin" label={isPinned ? '📌✓' : '📌'} onPress={toggle} />
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, pin)

    if (current === null) {
      return next(e)
    }

    const { Box, Button, Markdown, Text } = $.ui.resolve(e)
    const flip = () => update($, pin, now => (now ? { ...now, isExpanded: !now.isExpanded } : now))
    const unpin = () => update($, pin, () => null)

    return (
      <Box flexDirection="column">
        <Box>
          <Button key="toggle" label={current.isExpanded ? '📌 ▾' : '📌 ▸'} onPress={flip} />
          {!current.isExpanded && <Text dimColor> {current.summary} </Text>}
          <Button key="unpin" label="✕" onPress={unpin} />
        </Box>
        {current.isExpanded && <Markdown text={clip(current.text)} />}
        {await next(e)}
      </Box>
    )
  })
}
