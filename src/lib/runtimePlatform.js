const CLIENT_KEY = 'ldi-runtime-client'
const SHELL_VERSION_KEY = 'ldi-runtime-shell-version'
const STEAM_DEMO_CLIENT = 'steam-demo'

function readSessionValue(key) {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeSessionValue(key, value) {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    // The platform hint is optional; storage restrictions must not break the portal.
  }
}

function sanitizeShellVersion(value) {
  return /^\d+\.\d+\.\d+$/.test(value || '') ? value : null
}

const params = new URLSearchParams(window.location.search)
const requestedClient = params.get('client')
const requestedShellVersion = sanitizeShellVersion(params.get('shellVersion'))

if (requestedClient === STEAM_DEMO_CLIENT) {
  writeSessionValue(CLIENT_KEY, STEAM_DEMO_CLIENT)
  if (requestedShellVersion) writeSessionValue(SHELL_VERSION_KEY, requestedShellVersion)
}

const client = requestedClient === STEAM_DEMO_CLIENT || readSessionValue(CLIENT_KEY) === STEAM_DEMO_CLIENT
  ? STEAM_DEMO_CLIENT
  : 'web'
const shellVersion = client === STEAM_DEMO_CLIENT
  ? requestedShellVersion || sanitizeShellVersion(readSessionValue(SHELL_VERSION_KEY))
  : null

export const runtimePlatform = Object.freeze({
  client,
  shellVersion,
  isWeb: client === 'web',
  isSteamDemo: client === STEAM_DEMO_CLIENT,
})

export function assertExternalPurchasesAllowed() {
  if (!runtimePlatform.isSteamDemo) return
  const error = new Error('STEAM_DEMO_EXTERNAL_PURCHASE_DISABLED')
  error.code = 'STEAM_DEMO_EXTERNAL_PURCHASE_DISABLED'
  throw error
}
