const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanCorruptedData() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    console.log('📦 Connexion à MongoDB pour nettoyer les données...');

    const db = client.db();

    // ✅ Nettoyer les workspacemembers corrompus
    console.log('🧹 Nettoyage des workspacemembers avec user: null...');
    const result1 = await db.collection('workspacemembers').deleteMany({
      user: null
    });
    console.log(`   ✅ ${result1.deletedCount} entrées corrompues supprimées`);

    // ✅ Nettoyer les workspacemembers avec workspace: null
    const result2 = await db.collection('workspacemembers').deleteMany({
      workspace: null
    });
    console.log(`   ✅ ${result2.deletedCount} entrées workspace null supprimées`);

    // ✅ Nettoyer les doublons potentiels
    console.log('🔍 Recherche de doublons...');
    const duplicates = await db.collection('workspacemembers').aggregate([
      {
        $group: {
          _id: { workspace: "$workspace", user: "$user" },
          count: { $sum: 1 },
          docs: { $push: "$_id" }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();

    for (const duplicate of duplicates) {
      // Garder le premier, supprimer les autres
      const toDelete = duplicate.docs.slice(1);
      await db.collection('workspacemembers').deleteMany({
        _id: { $in: toDelete }
      });
      console.log(`   ✅ ${toDelete.length} doublons supprimés`);
    }

    console.log('✅ Nettoyage terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await client.close();
  }
}

cleanCorruptedData();
