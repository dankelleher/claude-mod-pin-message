export type Pin = {
  text: string
  summary: string
  isExpanded: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'pin-message': { pin: Pin | null }
  }
}
