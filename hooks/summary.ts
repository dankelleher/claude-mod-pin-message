const WORDS = 10
const MAX_LINES = 12

export const firstWords = (text: string): string => {
  const words = text.replace(/[#*_`>]/g, ' ').split(/\s+/).filter(Boolean)

  return words.length > WORDS ? `${words.slice(0, WORDS).join(' ')}…` : words.join(' ')
}

export const summaryPrompt = (text: string): string =>
  `Summarise the message below in at most ${WORDS} words. Reply with the summary only, no quotes or trailing punctuation.\n\n<message>\n${text.slice(0, 8000)}\n</message>`

export const cleanSummary = (reply: string): string => {
  const words = reply.replace(/^["'\s]+|["'\s.]+$/g, '').split(/\s+/).filter(Boolean)

  return words.length > WORDS + 4 ? '' : words.join(' ')
}

export const clip = (text: string): string => {
  const lines = text.split('\n')

  return lines.length > MAX_LINES ? `${lines.slice(0, MAX_LINES).join('\n')}\n…` : text
}
