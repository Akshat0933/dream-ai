import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "snaphomz_secret_fallback_key_32bytes_123456";
const ENCRYPTION_KEY = crypto.scryptSync(JWT_SECRET, "salt", 32); 
const IV = Buffer.alloc(16, 0); 

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedPassword) {
  const [salt, hash] = storedPassword.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === testHash;
}

export function createSessionToken(payload) {
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(JSON.stringify(payload), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function parseSessionToken(token) {
  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
    let decrypted = decipher.update(token, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
}
