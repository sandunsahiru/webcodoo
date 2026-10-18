const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://sandunsbandara13_db_user:8KZh5qqhZbst9XVQ@cluster0.izmxy6p.mongodb.net/webcodoo-pos?appName=Cluster0';

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('webcodoo-pos');

  const missing = await db.collection('orders').find({ source: { $exists: false }, orderId: /^WCD-/ }).toArray();
  console.log('Orders missing source:', missing.length);
  missing.forEach(o => console.log(' -', o.orderId, '|', o.name, '|', o.phone, '|', o.status, '|', o.createdAt));

  if (missing.length > 0) {
    const result = await db.collection('orders').updateMany(
      { source: { $exists: false }, orderId: /^WCD-/ },
      { $set: { source: 'webcodoo' } }
    );
    console.log('Updated:', result.modifiedCount, 'orders');
  } else {
    console.log('Nothing to update.');
  }

  await client.close();
}

run().catch(console.error);
