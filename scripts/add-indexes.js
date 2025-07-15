const { MongoClient } = require("mongodb");
require("dotenv").config();

async function addPerformanceIndexes() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    console.log("📦 Connexion à MongoDB pour ajouter les index...");

    const db = client.db();

    console.log("🔧 Ajout des index de performance...");

    // ✅ Fonction helper pour créer des index en toute sécurité
    async function createIndexSafely(collection, indexSpec, options = {}) {
      try {
        await db.collection(collection).createIndex(indexSpec, options);
        console.log(
          `  ✅ Index ${collection} ajouté: ${JSON.stringify(indexSpec)}`,
        );
      } catch (error) {
        if (error.code === 85) {
          // IndexAlreadyExists
          console.log(
            `  ⚠️  Index ${collection} existe déjà: ${JSON.stringify(indexSpec)}`,
          );
        } else if (error.code === 11000) {
          // DuplicateKey
          console.log(
            `  ⚠️  Données dupliquées détectées pour ${collection}, index ignoré`,
          );
        } else {
          console.error(`  ❌ Erreur index ${collection}:`, error.message);
        }
      }
    }

    // ✅ Index pour les utilisateurs
    await createIndexSafely("users", { email: 1 }, { unique: true });
    await createIndexSafely("users", { emailVerified: 1 });
    await createIndexSafely("users", { createdAt: -1 });

    // ✅ Index pour les workspaces
    await createIndexSafely("workspaces", { owner: 1 });
    await createIndexSafely("workspaces", { createdAt: -1 });

    // ✅ Index pour les projets
    await createIndexSafely("projects", { workspace: 1 });
    await createIndexSafely("projects", { createdBy: 1 });
    await createIndexSafely("projects", { workspace: 1, createdAt: -1 });

    // ✅ Index pour les tâches
    await createIndexSafely("tasks", { project: 1 });
    await createIndexSafely("tasks", { assignedTo: 1 });
    await createIndexSafely("tasks", { status: 1 });
    await createIndexSafely("tasks", { project: 1, status: 1 });

    // ✅ Index pour les membres de workspace (avec gestion des données corrompues)
    console.log("🔍 Vérification des données workspacemembers...");
    const corruptedCount = await db
      .collection("workspacemembers")
      .countDocuments({
        $or: [{ user: null }, { workspace: null }],
      });

    if (corruptedCount > 0) {
      console.log(
        `⚠️  ${corruptedCount} entrées corrompues détectées. Exécutez d'abord: node scripts/clean-data.js`,
      );
    } else {
      await createIndexSafely(
        "workspacemembers",
        { workspace: 1, user: 1 },
        { unique: true },
      );
      await createIndexSafely("workspacemembers", { user: 1 });
    }

    // ✅ Index pour les chats
    await createIndexSafely("chats", { workspace: 1 });
    await createIndexSafely("chats", { participants: 1 });
    await createIndexSafely("chats", { workspace: 1, type: 1 });

    console.log("\n🎉 Process d'indexation terminé !");
    console.log("📊 Votre base de données est maintenant optimisée.");
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout des index:", error);
  } finally {
    await client.close();
  }
}

addPerformanceIndexes();
