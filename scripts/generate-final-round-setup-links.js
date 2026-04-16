#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { createHash, createHmac, randomBytes } = require('crypto')
const { createClient } = require('@supabase/supabase-js')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')

    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function loadLocalEnv() {
  const cwd = process.cwd()
  loadEnvFile(path.join(cwd, '.env.local'))
  loadEnvFile(path.join(cwd, '.env'))
}

function parseArgs(argv) {
  const args = {
    in: '',
    out: 'final-round-setup-links.csv',
    ttlMinutes: 180,
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (token === '--in') {
      args.in = argv[index + 1] || ''
      index += 1
      continue
    }

    if (token === '--out') {
      args.out = argv[index + 1] || args.out
      index += 1
      continue
    }

    if (token === '--ttl-minutes') {
      const minutes = Number(argv[index + 1] || '180')
      args.ttlMinutes = Number.isFinite(minutes) ? Math.max(5, Math.min(24 * 60, Math.floor(minutes))) : 180
      index += 1
      continue
    }

    if (token === '--base-url') {
      args.baseUrl = argv[index + 1] || args.baseUrl
      index += 1
      continue
    }
  }

  return args
}

function readEnv(name) {
  const value = process.env[name]

  if (!value || !value.trim()) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value.trim()
}

function splitCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      const next = line[i + 1]

      if (inQuotes && next === '"') {
        current += '"'
        i += 1
        continue
      }

      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

function parseCsv(input) {
  const lines = input
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.trim())
  const rows = lines.slice(1).map((line) => {
    const cols = splitCsvLine(line)
    const row = {}

    headers.forEach((header, index) => {
      row[header] = (cols[index] || '').trim()
    })

    return row
  })

  return { headers, rows }
}

function csvEscape(value) {
  const text = String(value ?? '')

  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

function toCsv(headers, rows) {
  const lines = []
  lines.push(headers.map(csvEscape).join(','))

  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header] || '')).join(','))
  }

  return `${lines.join('\n')}\n`
}

function resolveColumnName(headers, candidates) {
  const lower = new Map(headers.map((header) => [header.toLowerCase(), header]))

  for (const candidate of candidates) {
    const found = lower.get(candidate.toLowerCase())

    if (found) {
      return found
    }
  }

  return null
}

function createPasswordHashDigest(passwordHash) {
  return createHash('sha256').update(String(passwordHash || '').trim()).digest('hex')
}

function signValue(encodedPayload, setupSecret) {
  return createHmac('sha256', setupSecret).update(encodedPayload).digest('base64url')
}

function createSetupToken({ teamId, passwordHash, ttlSeconds, setupSecret }) {
  const payload = {
    teamId,
    passwordHashDigest: createPasswordHashDigest(passwordHash),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomBytes(12).toString('hex'),
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = signValue(encodedPayload, setupSecret)
  return `${encodedPayload}.${signature}`
}

async function main() {
  loadLocalEnv()
  const args = parseArgs(process.argv.slice(2))

  if (!args.in) {
    throw new Error('Usage: node scripts/generate-final-round-setup-links.js --in <input.csv> [--out <output.csv>] [--ttl-minutes 180] [--base-url https://your-domain]')
  }

  const inputPath = path.resolve(process.cwd(), args.in)
  const outputPath = path.resolve(process.cwd(), args.out)

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`)
  }

  const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY')
  const setupSecret = (process.env.FINAL_ROUND_SETUP_SECRET || process.env.FINAL_ROUND_SESSION_SECRET || '').trim()

  if (!setupSecret) {
    throw new Error('Missing FINAL_ROUND_SETUP_SECRET (or FINAL_ROUND_SESSION_SECRET) in environment')
  }

  const { headers, rows } = parseCsv(fs.readFileSync(inputPath, 'utf8'))

  if (rows.length === 0) {
    throw new Error('Input CSV has no rows')
  }

  const teamIdColumn = resolveColumnName(headers, ['team_id', 'teamId', 'team id', 'Team ID'])
  const teamNameColumn = resolveColumnName(headers, ['team_name', 'teamName', 'team name', 'Team Name'])

  if (!teamIdColumn) {
    throw new Error('Could not find team ID column. Use one of: team_id, teamId, team id')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: finalRoundTeams, error } = await supabase
    .from('final_round_teams')
    .select('team_id, team_name, password_hash')

  if (error) {
    throw new Error(error.message)
  }

  const lookup = new Map((finalRoundTeams || []).map((item) => [String(item.team_id).trim(), item]))
  const ttlSeconds = args.ttlMinutes * 60
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()
  const outputRows = []

  for (const sourceRow of rows) {
    const teamId = String(sourceRow[teamIdColumn] || '').trim()
    const inputTeamName = teamNameColumn ? String(sourceRow[teamNameColumn] || '').trim() : ''

    const out = { ...sourceRow }

    if (!teamId) {
      out.status = 'error'
      out.note = 'Missing team ID in input row'
      out.setup_link = ''
      out.expires_at = ''
      out.email_subject = ''
      out.email_body = ''
      outputRows.push(out)
      continue
    }

    const team = lookup.get(teamId)

    if (!team) {
      out.status = 'error'
      out.note = 'Team ID not found in final_round_teams'
      out.setup_link = ''
      out.expires_at = ''
      out.email_subject = ''
      out.email_body = ''
      outputRows.push(out)
      continue
    }

    const token = createSetupToken({
      teamId,
      passwordHash: team.password_hash,
      ttlSeconds,
      setupSecret,
    })

    const cleanBaseUrl = args.baseUrl.endsWith('/') ? args.baseUrl.slice(0, -1) : args.baseUrl
    const setupLink = `${cleanBaseUrl}/final-round/setup-password?token=${encodeURIComponent(token)}`
    const teamName = inputTeamName || String(team.team_name || teamId)

    out.status = 'ok'
    out.note = ''
    out.setup_link = setupLink
    out.expires_at = expiresAt
    out.email_subject = 'Sankalp Bharat 2K26 Final Round Password Setup'
    out.email_body = `Hello ${teamName},\n\nPlease set your Final Round portal password using this secure link:\n${setupLink}\n\nThis link expires at: ${expiresAt}\n\nAfter setting your password, log in at ${cleanBaseUrl}/final-round\n\nRegards,\nSankalp Bharat Team`

    outputRows.push(out)
  }

  const outputHeaders = [
    ...headers,
    'status',
    'note',
    'setup_link',
    'expires_at',
    'email_subject',
    'email_body',
  ]

  fs.writeFileSync(outputPath, toCsv(outputHeaders, outputRows), 'utf8')

  const okCount = outputRows.filter((row) => row.status === 'ok').length
  const errorCount = outputRows.length - okCount

  console.log(`Generated ${outputPath}`)
  console.log(`Rows processed: ${outputRows.length}`)
  console.log(`Success: ${okCount}`)
  console.log(`Errors: ${errorCount}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
