import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

interface SetupTokenPayload {
  teamId: string
  passwordHashDigest: string
  exp: number
  nonce: string
}

const resolveSetupSecret = () => process.env.FINAL_ROUND_SETUP_SECRET || process.env.FINAL_ROUND_SESSION_SECRET

const base64UrlEncode = (input: string) => Buffer.from(input, 'utf8').toString('base64url')
const base64UrlDecode = (input: string) => Buffer.from(input, 'base64url').toString('utf8')

const signValue = (value: string) => {
  const secret = resolveSetupSecret()

  if (!secret) {
    throw new Error('FINAL_ROUND_SETUP_SECRET is missing')
  }

  return createHmac('sha256', secret).update(value).digest('base64url')
}

const normalizePasswordHash = (passwordHash: string) => passwordHash.trim()

export const createPasswordHashDigest = (passwordHash: string) =>
  createHash('sha256').update(normalizePasswordHash(passwordHash)).digest('hex')

export function createFinalRoundSetupToken(teamId: string, passwordHash: string, ttlSeconds = 60 * 60 * 3) {
  const payload: SetupTokenPayload = {
    teamId,
    passwordHashDigest: createPasswordHashDigest(passwordHash),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomBytes(12).toString('hex'),
  }

  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signValue(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function verifyFinalRoundSetupToken(token?: string | null): SetupTokenPayload | null {
  if (!token) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signValue(encodedPayload)

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SetupTokenPayload

    if (!payload?.teamId || !payload?.passwordHashDigest || !payload?.exp) {
      return null
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
