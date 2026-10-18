/**
 * VPS Image Upload Server
 * Deploy on your VPS (51.79.243.2) with PM2:
 *
 *   npm install express multer
 *   UPLOAD_SECRET=your-secret-here pm2 start vps-image-server.js --name image-server
 *
 * Images are served at: http://51.79.243.2:3001/assets/products/filename.jpg
 * Upload endpoint:       POST http://51.79.243.2:3001/upload
 *   Headers: x-upload-secret: your-secret-here
 *   Body:    multipart/form-data with field "image"
 *
 * Optional nginx config for production (proxy + cache headers):
 *   location /assets/ {
 *     proxy_pass http://localhost:3001/assets/;
 *     expires 30d;
 *     add_header Cache-Control "public, immutable";
 *   }
 */

const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3001
const UPLOAD_DIR = path.join(__dirname, 'assets', 'products')
const API_SECRET = process.env.UPLOAD_SECRET || 'change-this-secret'

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
    cb(null, `${base}-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Only image files allowed'))
  },
})

// CORS for POS (Vercel)
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'x-upload-secret, content-type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  next()
})
app.options('/{*path}', (_req, res) => res.sendStatus(200))

// Serve uploaded images
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  maxAge: '30d',
  immutable: true,
}))

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }))

// Upload endpoint
app.post('/upload', (req, res) => {
  const secret = req.headers['x-upload-secret']
  if (secret !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No image file provided' })

    const host = `http://${req.hostname === 'localhost' ? '51.79.243.2' : req.hostname}:${PORT}`
    const url = `${host}/assets/products/${req.file.filename}`
    res.json({ url, filename: req.file.filename, size: req.file.size })
  })
})

// Delete endpoint (optional cleanup)
app.delete('/assets/products/:filename', (req, res) => {
  const secret = req.headers['x-upload-secret']
  if (secret !== API_SECRET) return res.status(401).json({ error: 'Unauthorized' })

  const filename = path.basename(req.params.filename)
  const filepath = path.join(UPLOAD_DIR, filename)
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'File not found' })

  fs.unlinkSync(filepath)
  res.json({ ok: true, deleted: filename })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Image server running on port ${PORT}`)
  console.log(`Images at: http://51.79.243.2:${PORT}/assets/products/`)
})
