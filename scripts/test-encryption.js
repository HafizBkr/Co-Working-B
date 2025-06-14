const crypto = require("crypto");

function testEncryption() {
  console.log(" Testing encryption system...\n");

  // Configuration identique à celle du service
  const ALGORITHM = "aes-256-gcm";
  const KEY_LENGTH = 32;
  const IV_LENGTH = 16;

  // Test avec une clé générée
  const testKey = crypto.randomBytes(KEY_LENGTH);
  const testMessage = "Ceci est un message de test secret ";

  try {
    // Chiffrement
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, testKey, iv);

    let encrypted = cipher.update(testMessage, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();

    const encryptedData = `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
    console.log(" Encryption successful");
    console.log("   Original:", testMessage);
    console.log("   Encrypted:", encryptedData);

    // Déchiffrement
    const [ivHex, tagHex, encryptedMsg] = encryptedData.split(":");
    const ivDecrypt = Buffer.from(ivHex, "hex");
    const tagDecrypt = Buffer.from(tagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, testKey, ivDecrypt);
    decipher.setAuthTag(tagDecrypt);

    let decrypted = decipher.update(encryptedMsg, "hex", "utf8");
    decrypted += decipher.final("utf8");

    console.log(" Decryption successful");
    console.log("   Decrypted:", decrypted);
    console.log("   Match:", testMessage === decrypted ? "✅" : "❌");
  } catch (error) {
    console.error("❌ Encryption test failed:", error);
  }
}

testEncryption();
