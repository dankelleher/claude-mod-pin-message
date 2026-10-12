import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Pin } from '../types'
import { cleanSummary, clip, firstWords, summaryPrompt } from './summary'

const pin = atom({ plugin: 'pin-message', key: 'pin' } as const, null)

export const register: Register = on => {
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const row = await next(e)
    const text = e.props.text.trim()

    if (e.props.isSummary || text === '') {
      return row
    }

    const { Box, Button } = $.ui.resolve(e)
    const current = await read($, pin)
    const isPinned = current?.text === text

    const toggle = async () => {
      if (isPinned) {
        await update($, pin, () => null)

        return
      }

      const fresh: Pin = { text, summary: firstWords(text), isExpanded: false }
      await update($, pin, () => fresh)

      const result = await $.model.complete({ model: 'haiku', prompt: summaryPrompt(text) })
      const summary = result.isAnswered ? cleanSummary(result.text) : ''

      if (summary !== '') {
        await update($, pin, now => (now?.text === text ? { ...now, summary } : now))
      }
    }

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
