/**
 * add-missing-products.js
 *
 * Inserts the 5 products that exist in the static website but were
 * never added to the POS: JetBrains Edu, Figma Edu, Duolingo Super,
 * edX, iLovePDF.
 *
 * Run from VPS:
 *   node /home/ubuntu/image-server/add-missing-products.js
 */

const { MongoClient, ObjectId } = require('mongodb')
const fs = require('fs')
const path = require('path')

const envFile = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  })
}

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://sandunsbandara13_db_user:8KZh5qqhZbst9XVQ@cluster0.izmxy6p.mongodb.net/webcodoo-pos?appName=Cluster0'

const now = new Date()

const PRODUCTS = [
  {
    name: 'JetBrains Edu',
    slug: 'jetbrains-edu',
    period: 12,
    periodUnit: 'months',
    type: 'shared',
    quantity: 0,
    price: 2500,
    cost: 0,
    isActive: true,
    showOnWebsite: false,
    tagline: 'Full IDE suite for developers',
    icon: '💻',
    category: 'Development',
    color: 'from-blue-500 to-cyan-600',
    description: 'Official JetBrains Educational subscription — equivalent to the Pro plan. Includes all JetBrains IDEs. Login details provided.',
    accessMethod: 'We provide official login details for the Edu subscription.',
    features: [
      'All JetBrains IDEs',
      'IntelliJ IDEA, PyCharm, WebStorm',
      'GoLand, DataGrip, Rider & more',
      'Official Edu plan',
      '1-year access',
    ],
    variations: [
      {
        _id: new ObjectId(),
        label: '1 Year',
        price: 2500,
        cost: 0,
        period: 12,
        periodUnit: 'months',
        stock: -1,
        highlight: false,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'Figma Edu',
    slug: 'figma-edu',
    period: 24,
    periodUnit: 'months',
    type: 'shared',
    quantity: 0,
    price: 3000,
    cost: 0,
    isActive: true,
    showOnWebsite: false,
    tagline: 'Professional UI/UX design tool',
    icon: '🎨',
    category: 'Design',
    badge: 'Best Value',
    color: 'from-orange-500 to-amber-600',
    description: 'Official Figma Educational subscription — equivalent to the Pro plan. Login details provided. 2 full years of access.',
    accessMethod: 'We provide official Edu login details (email and password) for the subscription.',
    features: [
      'Unlimited projects',
      'Advanced prototyping',
      'Dev Mode access',
      'Team collaboration',
      '2 years of access',
    ],
    variations: [
      {
        _id: new ObjectId(),
        label: '2 Years',
        price: 3000,
        cost: 0,
        period: 24,
        periodUnit: 'months',
        stock: -1,
        highlight: false,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'Duolingo Super',
    slug: 'duolingo-super',
    period: 12,
    periodUnit: 'months',
    type: 'shared',
    quantity: 0,
    price: 1500,
    cost: 0,
    isActive: true,
    showOnWebsite: false,
    tagline: 'Learn languages without limits',
    icon: '🦉',
    category: 'Education',
    color: 'from-lime-500 to-green-600',
    description: 'Official Duolingo Super 1-year subscription. Email and password provided for full access to all Super features.',
    accessMethod: 'We provide the official email and password login details.',
    features: [
      'No ads',
      'Unlimited hearts',
      'Legendary levels',
      'Streak repair',
      '1 year official access',
    ],
    variations: [
      {
        _id: new ObjectId(),
        label: '1 Year',
        price: 1500,
        cost: 0,
        period: 12,
        periodUnit: 'months',
        stock: -1,
        highlight: false,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'edX',
    slug: 'edx',
    period: 12,
    periodUnit: 'months',
    type: 'shared',
    quantity: 0,
    price: 2000,
    cost: 0,
    isActive: true,
    showOnWebsite: false,
    tagline: 'World-class online courses',
    icon: '🎓',
    category: 'Education',
    color: 'from-indigo-500 to-violet-600',
    description: 'Official edX 1-year subscription. Email and password provided for full course access.',
    accessMethod: 'We provide the official email and password login details.',
    features: [
      'Verified certificate courses',
      'Unlimited course access',
      'University-backed content',
      'MicroMasters programs',
      '1 year official access',
    ],
    variations: [
      {
        _id: new ObjectId(),
        label: '1 Year',
        price: 2000,
        cost: 0,
        period: 12,
        periodUnit: 'months',
        stock: -1,
        highlight: false,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'iLovePDF',
    slug: 'ilovepdf',
    period: 12,
    periodUnit: 'months',
    type: 'shared',
    quantity: 0,
    price: 1000,
    cost: 0,
    isActive: true,
    showOnWebsite: false,
    tagline: 'Complete PDF toolkit online',
    icon: '📄',
    category: 'Productivity',
    color: 'from-red-500 to-orange-600',
    description: 'Official iLovePDF 1-year subscription. Email and password provided for unlimited PDF tools.',
    accessMethod: 'We provide the official email and password login details.',
    features: [
      'Merge, split, compress PDFs',
      'PDF to Word/Excel/JPG',
      'eSign documents',
      'Unlimited use',
      '1 year official access',
    ],
    variations: [
      {
        _id: new ObjectId(),
        label: '1 Year',
        price: 1000,
        cost: 0,
        period: 12,
        periodUnit: 'months',
        stock: -1,
        highlight: false,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
]

async function run() {
  console.log('Connecting to MongoDB…')
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const col = client.db('webcodoo-pos').collection('products')

  let inserted = 0
  let skipped = 0

  for (const product of PRODUCTS) {
    const existing = await col.findOne({ slug: product.slug })
    if (existing) {
      console.log(`  ⚠ Already exists: ${product.slug} — skipped`)
      skipped++
      continue
    }
    await col.insertOne(product)
    console.log(`  ✓ Inserted: ${product.name} (${product.slug})`)
    inserted++
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`)
  await client.close()
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
