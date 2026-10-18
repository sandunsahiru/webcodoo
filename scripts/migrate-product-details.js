/**
 * migrate-product-details.js
 *
 * One-time script: copies all rich product content from the static
 * lib/products.ts definitions into MongoDB.
 *
 * Fields written (only if not already set in DB):
 *   tagline, category, icon, badge, color, description,
 *   accessMethod, features, note, loginLink
 *
 * Run from VPS (has Atlas DNS access):
 *   node /home/ubuntu/image-server/migrate-product-details.js
 */

const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

// Auto-load .env.local
const envFile = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  })
}

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://sandunsbandara13_db_user:8KZh5qqhZbst9XVQ@cluster0.izmxy6p.mongodb.net/webcodoo-pos?appName=Cluster0'

// All static product details
const PRODUCT_DETAILS = [
  {
    slug: 'stealthwriter',
    tagline: 'AI-powered undetectable writing',
    icon: '✍️',
    category: 'AI Writing',
    badge: 'Popular',
    color: 'from-violet-600 to-purple-700',
    description: 'StealthWriter AI Premium Plan gives you access to powerful AI-undetectable writing tools. We create a dedicated account linked to your email address — access is provided through our secure portal.',
    accessMethod: 'We create an account for your email address. Access is provided through our dedicated portal (not the official StealthWriter website) to ensure stability and prevent over-usage.',
    loginLink: 'https://app.thesisseotools.com/member',
    features: [
      'Up to 5,000 words per request',
      'AI detection bypass',
      'Full 1-month warranty',
      'Dedicated portal access',
      'Human-like rewriting',
    ],
    note: 'All plans include full 1-month warranty and up to 5,000 words per request.',
  },
  {
    slug: 'quillbot',
    tagline: 'AI paraphrasing & humanizing',
    icon: '🖊️',
    category: 'AI Writing',
    color: 'from-green-500 to-emerald-600',
    description: 'Official Quillbot Premium account — email and password provided. Includes AI Humanizer, Paraphraser, and Plagiarism Checker. Note: plagiarism checker has limited checks as this is a sharing account.',
    accessMethod: 'We provide the official website login email and password directly to you.',
    features: [
      'AI Humanizer tool',
      'Paraphrasing tool',
      'Plagiarism checker (limited docs)',
      'Official account access',
      'Multiple duration options',
    ],
    note: 'Plagiarism checker may have limited documents available as this is a shared account.',
  },
  {
    slug: 'capcut',
    tagline: 'Professional video editing suite',
    icon: '🎬',
    category: 'Creative',
    color: 'from-pink-500 to-rose-600',
    description: 'CapCut Pro official account with full access to all Pro features. Login details (email and password) provided directly to you.',
    accessMethod: 'Official account login through our email and password.',
    features: [
      'All Pro editing features',
      'No watermark exports',
      '4K export support',
      'Premium templates & effects',
      'Official Pro plan',
    ],
  },
  {
    slug: 'jetbrains-edu',
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
  },
  {
    slug: 'figma-edu',
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
  },
  {
    slug: 'ai-plagiarism',
    tagline: 'Official Turnitin reports',
    icon: '🔍',
    category: 'Academic',
    badge: 'No Subscription',
    color: 'from-red-500 to-rose-700',
    description: 'Get official Turnitin reports from our platform. Each submission gives you both a Plagiarism (Similarity) report and an AI detection report.',
    accessMethod: 'Submit your document through our website. You receive official Turnitin reports.',
    features: [
      'Official Turnitin similarity report',
      'AI content detection report',
      'Fast turnaround',
      'Both reports per submission',
      'No subscription needed',
    ],
  },
  {
    slug: 'gemini-ai',
    tagline: "Google's most capable AI model",
    icon: '✨',
    category: 'AI Tools',
    badge: '18 Months',
    color: 'from-sky-500 to-blue-600',
    description: '18-month Gemini AI Pro plan. We provide a subscription activation link — you activate it directly on your own Google account. No warranty.',
    accessMethod: 'We provide a subscription activation link. You activate it yourself on your Google account email.',
    features: [
      'Gemini 1.5 Pro access',
      'Advanced reasoning',
      'Multimodal capabilities',
      '18 months duration',
      'Activate on your own account',
    ],
    note: 'No warranty. Activation link provided — apply to your own Google account.',
  },
  {
    slug: 'duolingo-super',
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
  },
  {
    slug: 'edx',
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
  },
  {
    slug: 'ilovepdf',
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
  },
  {
    slug: 'canva-edu',
    tagline: 'Professional design made easy',
    icon: '🎨',
    category: 'Design',
    badge: 'Best Value',
    color: 'from-teal-400 to-purple-500',
    description: 'Canva Education plan — 1 full year of access to Canva Pro features. We provide an activation link you apply directly to your own email account.',
    accessMethod: 'We provide an activation link. You activate it on your own email account — no password sharing required.',
    features: [
      'All Canva Pro features',
      'Unlimited premium templates',
      '100GB cloud storage',
      'Background remover',
      '1 year access on your account',
    ],
    note: 'Activation link provided — applied to your own email account.',
  },
  {
    slug: 'zoom',
    tagline: 'HD video meetings for everyone',
    icon: '📹',
    category: 'Productivity',
    color: 'from-sky-400 to-blue-500',
    description: 'Official Zoom account with up to 100 participants. Email and password provided. Includes 28-day warranty for full peace of mind.',
    accessMethod: 'We provide the official Zoom account login email and password directly to you.',
    features: [
      'Up to 100 participants',
      'HD video & audio',
      'Screen sharing',
      'Meeting recording',
      '28-day warranty',
    ],
    note: '28-day warranty included. Login details (email and password) provided.',
  },
  {
    slug: 'ms-office-365',
    tagline: 'Full Microsoft productivity suite',
    icon: '🪟',
    category: 'Productivity',
    badge: '🔥 Hot Deal',
    color: 'from-blue-600 to-indigo-700',
    description: 'Official Microsoft 365 1-year subscription. Includes Word, Excel, PowerPoint, Outlook, Teams and more. Email and password provided.',
    accessMethod: 'We provide the official email and password login details.',
    features: [
      'Word, Excel, PowerPoint',
      '1TB OneDrive storage',
      'Outlook & Teams',
      '5 devices simultaneously',
      '1 year official access',
    ],
  },
]

async function run() {
  console.log('Connecting to MongoDB…')
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db('webcodoo-pos')
  const col = db.collection('products')

  let updated = 0
  let notFound = 0

  for (const detail of PRODUCT_DETAILS) {
    const { slug, ...fields } = detail

    const existing = await col.findOne({ slug })
    if (!existing) {
      console.log(`  ⚠ Not found in DB: ${slug}`)
      notFound++
      continue
    }

    // Build update — only set fields that are not already filled in DB
    const $set = {}
    for (const [key, value] of Object.entries(fields)) {
      const dbVal = existing[key]
      const isEmpty = dbVal === undefined || dbVal === null || dbVal === '' ||
        (Array.isArray(dbVal) && dbVal.length === 0)
      if (isEmpty) {
        $set[key] = value
      }
    }

    if (Object.keys($set).length === 0) {
      console.log(`  ✓ ${slug} — already filled, skipped`)
      continue
    }

    await col.updateOne({ slug }, { $set: { ...$set, updatedAt: new Date() } })
    console.log(`  ✓ ${slug} — set: ${Object.keys($set).join(', ')}`)
    updated++
  }

  console.log(`\nDone. Updated ${updated} products. Not found: ${notFound}.`)
  await client.close()
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
