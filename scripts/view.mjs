import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const url = process.env.VITE_DEV_URL || 'http://localhost:5173'
const codexHome = process.env.CODEX_HOME || `${process.env.HOME}/.codex`
const pwcli = join(codexHome, 'skills', 'playwright', 'scripts', 'playwright_cli.sh')

if (!existsSync(pwcli)) {
  console.error('Playwright CLI wrapper not found:', pwcli)
  process.exit(1)
}

const run = (args) => execFileSync(pwcli, args, { stdio: 'inherit' })
const session = 'farsifix-view'

try {
  run(['open', url, '--headed', '--session', session])
} catch (error) {
  console.warn('Session already configured, reusing existing session.')
  run(['open', url, '--session', session])
}
