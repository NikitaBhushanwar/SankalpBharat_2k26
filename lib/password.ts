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
  process.env.ADMIN_PASSWORD_ENCRYPTION_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'sankalp-bharat-admin-password-secret'

const resolveEncryptionKey = () =>
  createHash('sha256').update(resolvePasswordEncryptionSecret()).digest()

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

  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      resolveEncryptionKey(),
      Buffer.from(ivHex, 'hex')
    )
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ])
    return decrypted.toString('utf8')
  } catch {
    return null
  }
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
