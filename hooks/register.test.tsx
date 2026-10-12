import type { On, RenderElement } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

const SURFACES = ['terminal', 'desktop'] as const
const SITE = { plugin: 'pin-message', viewport: { columns: 100, rows: 30 } } as const
const STOCK: RenderElement = { type: 'Text', props: {}, children: ['stock row'] }
const USAGE = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }

function stub(on: On, reply: string | null) {
  mock.clock(on, { now: 1 })
  on('ui.render', () => STOCK)
  on('model.complete', () => ({
    value: reply === null ? { isAnswered: false, reason: 'api-error', usage: USAGE } : { isAnswered: true, text: reply, usage: USAGE },
  }))
}

const message = (surface: (typeof SURFACES)[number], text: string, extra = {}) =>
  ({ ...SITE, surface, component: 'AssistantMessage', requestId: text, props: { text, isFirstOfReply: true, ...extra } }) as const

const band = (surface: (typeof SURFACES)[number]) =>
  ({ ...SITE, surface, component: 'AbovePrompt', requestId: 'band', props: { hasSurvey: false } }) as const

for (const surface of SURFACES) {
  test(`pin, expand, replace and unpin on ${surface}`, async ($, on) => {
    stub(on, 'Plan for the migration')
    const text = 'First reply about the database migration plan'

    const quiet = await $.ui.mount(band(surface))
    expect(await quiet.find({ type: 'Text', text: 'stock row' })).toBeDefined()

    const row = await $.ui.mount(message(surface, text))
    expect(await row.find({ type: 'Text', text: 'stock row' })).toBeDefined()
    await row.press({ key: 'pin' })

    const pinned = quiet
    expect(await pinned.find({ type: 'Text', text: /Plan for the migration/ })).toBeDefined()
    await pinned.press({ key: 'toggle' })
    expect(await pinned.find({ type: 'Markdown' })).toBeDefined()

    const other = await $.ui.mount(message(surface, 'Second reply'))
    await other.press({ key: 'pin' })
    const replaced = quiet
    await replaced.press({ key: 'toggle' })
    expect(await replaced.find({ type: 'Markdown', text: /Second reply/ })).toBeDefined()

    await replaced.press({ key: 'unpin' })
    const gone = quiet
    expect(await gone.find({ type: 'Text', text: 'stock row' })).toBeDefined()
  })

  test(`a failed summary keeps the first words on ${surface}`, async ($, on) => {
    stub(on, null)
    const row = await $.ui.mount(message(surface, 'alpha beta gamma delta'))
    await row.press({ key: 'pin' })
    const pinned = await $.ui.mount(band(surface))
    expect(await pinned.find({ type: 'Text', text: /alpha beta gamma delta/ })).toBeDefined()
  })

  test(`summary rows and empty rows get no pin on ${surface}`, async ($, on) => {
    stub(on, 'x')
    const summary = await $.ui.mount(message(surface, 'a recap', { isSummary: true }))
    expect(await summary.find({ type: 'Button' })).toBeUndefined()
    const empty = await $.ui.mount(message(surface, '   '))
    expect(await empty.find({ type: 'Button' })).toBeUndefined()
  })
}

test('the pinned message is readable through the tool', async ($, on) => {
  stub(on, 'Short summary')
  on('tool.register', () => ({ value: { tool: 'mcp__pin-message__get_pinned_message' } }))
  const call = () => $.tool.call({ tool: 'mcp__pin-message__get_pinned_message' })

  expect((await call()).text ?? JSON.stringify((await call()).result)).toContain('Nothing is pinned')

  const row = await $.ui.mount(message('terminal', 'The pinned body text'))
  await row.press({ key: 'pin' })
  expect(JSON.stringify((await call()).result)).toContain('The pinned body text')
})
