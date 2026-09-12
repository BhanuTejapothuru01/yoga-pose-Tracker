import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env.local')

function loadEnvLocal() {
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
const databaseUrl = process.env.DATABASE_URL

function getProjectRef(supabaseUrl) {
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (!match) {
    throw new Error(
      'Invalid NEXT_PUBLIC_SUPABASE_URL in .env.local. Expected https://YOUR_REF.supabase.co'
    )
  }
  return match[1]
}

function getConnectionString() {
  if (databaseUrl) return databaseUrl

  const dbPassword = process.env.SUPABASE_DB_PASSWORD
  if (!dbPassword) {
    throw new Error(
      'Add DATABASE_URL to .env.local (recommended), or set SUPABASE_DB_PASSWORD.\n' +
        'Get DATABASE_URL from Supabase → Project Settings → Database → Connection string (URI, Session pooler).'
    )
  }

  const projectRef = getProjectRef(url)
  const host =
    process.env.SUPABASE_DB_HOST ||
    `aws-1-${process.env.SUPABASE_DB_REGION || 'ap-southeast-2'}.pooler.supabase.com`

  return `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@${host}:6543/postgres`
}

async function runMigrationsWithPg() {
  const client = new pg.Client({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  const migrationsDir = join(__dirname, '../supabase/migrations')
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    console.log(`Applying ${file}...`)
    await client.query(sql)
    console.log(`✓ ${file}`)
  }

  await client.end()
}

async function ensureStorageBucket() {
  const supabase = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.some((b) => b.name === 'avatars')) {
    const { error } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 2097152,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    })
    if (error && !/already exists/i.test(error.message)) throw error
    console.log('✓ avatars storage bucket created')
  } else {
    console.log('✓ avatars storage bucket exists')
  }
}

async function verify() {
  const supabase = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { count, error } = await supabase
    .from('yoga_poses')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  console.log(`✓ Database ready — ${count} yoga poses seeded`)
}

async function main() {
  if (!url || !secret) {
    throw new Error(
      'Missing Supabase env vars. Copy yoga-tracker/.env.local.example to yoga-tracker/.env.local and fill in your keys.'
    )
  }

  await runMigrationsWithPg()
  await ensureStorageBucket()
  await verify()
  console.log('Supabase setup complete.')
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
