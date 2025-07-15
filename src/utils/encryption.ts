import crypto from "crypto";

// Configuration du chiffrement
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

export class EncryptionService {
  private static encryptionKey: Buffer;

  /**
   * Initialise la clé de chiffrement depuis les variables d'environnement
   */
  static initialize() {
    const key = process.env.MESSAGE_ENCRYPTION_KEY;
    if (!key) {
      throw new Error(
        "MESSAGE_ENCRYPTION_KEY environment variable is required",
      );
    }

    // Si la clé est en base64, on la décode, sinon on la hash pour avoir 32 bytes
    if (key.length === 44 && key.match(/^[A-Za-z0-9+/]+=*$/)) {
      this.encryptionKey = Buffer.from(key, "base64");
    } else {
      this.encryptionKey = crypto.scryptSync(key, "salt", KEY_LENGTH);
    }
  }

  /**
   * Chiffre le contenu d'un message
   */
  static encrypt(text: string): string {
    if (!this.encryptionKey) {
      this.initialize();
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();

    // Format: iv:tag:encrypted
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  }

  /**
   * Déchiffre le contenu d'un message
   */
  static decrypt(encryptedData: string): string {
    if (!this.encryptionKey) {
      this.initialize();
    }

    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted message format");
    }

    const [ivHex, tagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Génère une nouvelle clé de chiffrement (utile pour le setup initial)
   */
  static generateKey(): string {
    return crypto.randomBytes(KEY_LENGTH).toString("base64");
  }

  /**
   * Vérifie si une chaîne est chiffrée (format attendu: iv:tag:encrypted)
   */
  static isEncrypted(data: string): boolean {
    const parts = data.split(":");
    return (
      parts.length === 3 &&
      parts[0].length === IV_LENGTH * 2 &&
      parts[1].length === TAG_LENGTH * 2
    );
  }
}
