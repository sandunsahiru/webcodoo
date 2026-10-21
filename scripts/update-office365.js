/**
 * update-office365.js
 *
 * Force-updates the ms-office-365 product in MongoDB with correct
 * Office 365 content. Run this if the product page shows wrong data.
 *
 *   node scripts/update-office365.js
 */

const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

const envFile = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  })
}

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set — add it to .env.local')
  process.exit(1)
}

async function run() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const col = client.db('webcodoo-pos').collection('products')

  const result = await col.updateOne(
    { slug: 'ms-office-365' },
    {
      $set: {
        name: 'MS Office 365',
        tagline: 'Full Microsoft 365 productivity suite',
        icon: '🪟',
        category: 'Productivity',
        badge: '🔥 Hot Deal',
        color: 'from-blue-600 to-indigo-700',
        description: 'Official Microsoft 365 1-year subscription. Includes Word, Excel, PowerPoint, Outlook, Teams and more. Shared account — email and password provided.',
        accessMethod: 'We provide the official Microsoft 365 account login email and password directly to you.',
        features: [
          'Word, Excel, PowerPoint',
          '1TB OneDrive storage',
          'Outlook & Teams',
          'Up to 5 devices simultaneously',
          '1 year official access',
        ],
        note: undefined,
        loginLink: undefined,
      },
    }
  )

  if (result.matchedCount === 0) {
    console.log('No product found with slug "ms-office-365" — nothing updated.')
  } else {
    console.log(`Updated ms-office-365: ${result.modifiedCount} document(s) modified.`)
  }

  await client.close()
}

run().catch(err => { console.error(err); process.exit(1) })
