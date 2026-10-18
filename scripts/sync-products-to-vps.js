/**
 * sync-products-to-vps.js
 *
 * Uploads all local product logos to the VPS image server,
 * then updates every matching product in MongoDB with:
 *   - the correct slug (matched from the website's static product list)
 *   - the new VPS-hosted image URL
 *
 * Prerequisites:
 *   1. VPS image server must be running:
 *        UPLOAD_SECRET=your-secret pm2 start vps-image-server.js --name image-server
 *   2. Set env vars (or edit the defaults below):
 *        MONGODB_URI=mongodb+srv://...
 *        VPS_IMAGE_URL=http://51.79.243.2:3001
 *        VPS_UPLOAD_SECRET=your-secret
 *
 * Run:
 *   node scripts/sync-products-to-vps.js
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')

// Auto-load .env.local if present (no dotenv dependency needed)
const envFile = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  })
}

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://sandunsbandara13_db_user:8KZh5qqhZbst9XVQ@cluster0.izmxy6p.mongodb.net/webcodoo-pos?appName=Cluster0'
const VPS_URL = (process.env.VPS_IMAGE_URL || 'http://51.79.243.2:3001').replace(/\/$/, '')
const VPS_SECRET = process.env.VPS_UPLOAD_SECRET || ''

// Logos directory (relative to this script's location → ../public/logos)
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'logos')

/**
 * Static product mapping.
 * keywords: substring matches against POS product name (case-insensitive)
 * slug:     the website URL slug
 * logoFile: filename in public/logos/ (null = use imageUrl directly)
 * imageUrl: external URL when no local file (optional)
 */
const PRODUCT_MAP = [
  { keywords: ['stealthwriter', 'stealth writer'],  slug: 'stealthwriter',    logoFile: 'stealthwriter.png' },
  { keywords: ['quillbot'],                          slug: 'quillbot',         logoFile: 'quillbot.png' },
  { keywords: ['capcut', 'cap cut'],                 slug: 'capcut',           logoFile: 'capcut.png' },
  { keywords: ['jetbrains', 'jet brains'],           slug: 'jetbrains-edu',    logoFile: 'jetbrains.png' },
  { keywords: ['figma'],                             slug: 'figma-edu',        logoFile: 'figma.png' },
  { keywords: ['duolingo'],                          slug: 'duolingo-super',   logoFile: 'duolingo.png' },
  { keywords: ['ilovepdf', 'love pdf', 'ilovepdf'], slug: 'ilovepdf',         logoFile: 'ilovepdf.png' },
  { keywords: ['canva'],                             slug: 'canva-edu',        logoFile: 'canva.png' },
  { keywords: ['zoom'],                              slug: 'zoom',             logoFile: 'zoom.png' },
  { keywords: ['microsoft', 'ms office', 'office 365', 'office365'],
                                                     slug: 'ms-office-365',    logoFile: 'microsoft.png' },
  { keywords: ['gemini'],                            slug: 'gemini-ai',        logoFile: null, imageUrl: 'https://cdn.simpleicons.org/googlegemini' },
  { keywords: ['edx'],                               slug: 'edx',              logoFile: null, imageUrl: 'https://cdn.simpleicons.org/edx' },
  { keywords: ['plagiarism', 'turnitin', 'ai checker', 'ai & plagiarism'],
                                                     slug: 'ai-plagiarism',    logoFile: null, imageUrl: 'https://logo.clearbit.com/turnitin.com' },
]

// Upload a local file to the VPS image server using only Node built-ins
function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(filePath)
    const ext = path.extname(filename).slice(1).toLowerCase()
    const mimeType = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' }[ext] || 'application/octet-stream'

    const fileContent = fs.readFileSync(filePath)
    const boundary = 'FormBoundary' + Date.now() + Math.random().toString(36).slice(2)
    const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`)
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`)
    const body = Buffer.concat([header, fileContent, footer])

    const url = new URL(`${VPS_URL}/upload`)
    const proto = url.protocol === 'https:' ? https : http
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'x-upload-secret': VPS_SECRET,
      },
    }

    const req = proto.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json)
          else reject(new Error(json.error || `HTTP ${res.statusCode}`))
        } catch { reject(new Error(`Invalid VPS response: ${data.slice(0, 200)}`)) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function matchProduct(productName) {
  const lower = productName.toLowerCase()
  for (const entry of PRODUCT_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) return entry
  }
  return null
}

// Generate a slug from a product name (fallback for unmatched products)
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function run() {
  console.log('Connecting to MongoDB…')
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db('webcodoo-pos')

  const products = await db.collection('products').find({}).toArray()
  console.log(`Found ${products.length} products in POS\n`)

  // Cache VPS uploads so same image isn't uploaded twice
  const uploadedUrls = {}

  let updated = 0
  for (const product of products) {
    const match = matchProduct(product.name)
    const slug = match?.slug ?? toSlug(product.name)
    let imageUrl = product.image || ''

    // Upload local logo if available and not already uploaded
    if (match?.logoFile) {
      const logoPath = path.join(LOGOS_DIR, match.logoFile)
      if (fs.existsSync(logoPath)) {
        if (!uploadedUrls[match.logoFile]) {
          process.stdout.write(`  Uploading ${match.logoFile} → `)
          try {
            const result = await uploadFile(logoPath)
            uploadedUrls[match.logoFile] = result.url
            console.log(result.url)
          } catch (err) {
            console.log(`FAILED: ${err.message}`)
            // Keep existing imageUrl if upload fails
          }
        }
        if (uploadedUrls[match.logoFile]) {
          imageUrl = uploadedUrls[match.logoFile]
        }
      } else {
        console.log(`  WARNING: Logo file not found: ${logoPath}`)
      }
    } else if (match?.imageUrl) {
      imageUrl = match.imageUrl
    }

    // Update MongoDB
    const update = { slug, updatedAt: new Date() }
    if (imageUrl) update.image = imageUrl

    await db.collection('products').updateOne(
      { _id: product._id },
      { $set: update }
    )

    const was = product.slug ? ` (was: ${product.slug})` : ''
    console.log(`  ✓ ${product.name}${was}`)
    console.log(`    slug: ${slug}  image: ${imageUrl || '(unchanged)'}`)
    updated++
  }

  console.log(`\nDone. Updated ${updated} products.`)
  await client.close()
}

run().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
