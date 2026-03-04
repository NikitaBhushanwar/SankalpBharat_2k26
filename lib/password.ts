import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'crypto'

const KEY_LENGTH = 64
const IV_LENGTH = 12

const resolvePasswordEncryptionSecret = () =>
  process.env.ADMIN_PASSWORD_ENCRYPTION_KEY

const resolveLegacyPasswordEncryptionSecrets = () =>
  [process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.NEXT_PUBLIC_SUPABASE_URL]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))

const resolveEncryptionKey = () => {
  const secret = resolvePasswordEncryptionSecret()

  if (!secret) {
    throw new Error('ADMIN_PASSWORD_ENCRYPTION_KEY is missing')
  }

  return createHash('sha256').update(secret).digest()
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hashedBuffer = scryptSync(password, salt, KEY_LENGTH)
  return `${salt}:${hashedBuffer.toString('hex')}`
}

export function encryptPassword(password: string) {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-gcm', resolveEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`
}

export function decryptPassword(encryptedPayload?: string | null) {
  if (!encryptedPayload) {
    return null
  }

  const [ivHex, encryptedHex, authTagHex] = encryptedPayload.split(':')

  if (!ivHex || !encryptedHex || !authTagHex) {
    return null
  }

  const trySecrets = [
    resolvePasswordEncryptionSecret(),
    ...resolveLegacyPasswordEncryptionSecrets(),
  ]
    .map((value) => value?.trim())
    .filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index)

  for (const secret of trySecrets) {
    try {
      const decipher = createDecipheriv(
        'aes-256-gcm',
        createHash('sha256').update(secret).digest(),
        Buffer.from(ivHex, 'hex')
      )
      decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, 'hex')),
        decipher.final(),
      ])
      return decrypted.toString('utf8')
    } catch {
      continue
    }
  }

  return null
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hashHex] = storedHash.split(':')

  if (!salt || !hashHex) {
    return false
  }

  const storedBuffer = Buffer.from(hashHex, 'hex')
  const candidateBuffer = scryptSync(password, salt, storedBuffer.length)
  return timingSafeEqual(storedBuffer, candidateBuffer)
}
