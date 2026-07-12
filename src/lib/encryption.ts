import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || "default_fallback_secret_key_123!";
// Ensure the key is exactly 32 bytes for AES-256
const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error("Invalid encrypted text format");
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}
