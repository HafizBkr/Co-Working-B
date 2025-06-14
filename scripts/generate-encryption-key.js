const crypto = require("crypto");

function generateKey() {
  const key = crypto.randomBytes(32).toString("base64");
  console.log(" Generated encryption key for messages:");
  console.log(key);
  console.log("\n Add this to your .env file:");
  console.log(`MESSAGE_ENCRYPTION_KEY=${key}`);
  console.log("\n⚠️  Important: Keep this key secret and backed up!");
  console.log(
    "   If you lose this key, existing encrypted messages will be unrecoverable.",
  );
}

console.log(" Generating secure encryption key...\n");
generateKey();
