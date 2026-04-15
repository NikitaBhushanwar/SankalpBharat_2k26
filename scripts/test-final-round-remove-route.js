const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { createClient } = require('@supabase/supabase-js')

function loadEnv(filePath) {
  const env = {}
  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    if (index === -1) continue
    env[line.slice(0, index).trim()] = line.slice(index + 1).trim()
  }
  return env
}

function createAdminSessionToken(email, secret) {
  const payload = {
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    nonce: crypto.randomBytes(12).toString('hex'),
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url')
  return `${encodedPayload}.${signature}`
}

async function main() {
  const env = loadEnv(path.join(__dirname, '..', '.env.local'))
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  const teamId = `DELTEST_${Date.now()}`
  const teamName = 'Delete Test'
  const passwordHash = '0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f:abcd'

  const { error: insertError } = await supabase
    .from('final_round_teams')
    .insert({ team_id: teamId, team_name: teamName, password_hash: passwordHash })

  if (insertError) throw insertError

  const token = createAdminSessionToken(env.PRIMARY_SUPER_ADMIN_EMAIL, env.ADMIN_SESSION_SECRET)

  const response = await fetch('http://localhost:3000/api/final-round/admin/teams', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `sb_admin_session=${token}`,
    },
    body: JSON.stringify({ teamId }),
  })

  const body = await response.text()
  console.log('delete-status', response.status)
  console.log('delete-body', body)

  const { data: after, error: checkError } = await supabase
    .from('final_round_teams')
    .select('team_id')
    .eq('team_id', teamId)

  if (checkError) throw checkError

  console.log('rows-after-delete', after.length)

  if (after.length > 0) {
    await supabase.from('final_round_teams').delete().eq('team_id', teamId)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
