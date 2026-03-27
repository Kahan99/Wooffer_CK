/**
 * One-time migration: converts contributors from flat [ObjectId]
 * to [{user: ObjectId, role: 'limited'}]
 */
const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/wooffer';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const col = mongoose.connection.db.collection('projects');
  const projects = await col.find({}).toArray();
  let migrated = 0;

  for (const p of projects) {
    const contribs = p.contributors || [];
    if (contribs.length === 0) continue;

    // Already migrated if first element has a 'user' key
    if (contribs[0] && typeof contribs[0] === 'object' && contribs[0].user) {
      console.log(`  [skip] ${p._id} – already migrated`);
      continue;
    }

    const updated = contribs.map((c) => ({ user: c, role: 'limited' }));
    await col.updateOne({ _id: p._id }, { $set: { contributors: updated } });
    console.log(`  [ok]   ${p._id} – migrated ${updated.length} contributor(s)`);
    migrated++;
  }

  console.log(`\nDone. ${migrated} project(s) migrated.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
