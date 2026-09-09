import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import mongoose from 'mongoose'

const LEGACY_USER_FIELDS = [
  'googleId',
  'githubId',
  'isEmailVerified',
  'emailVerificationToken',
  'emailVerificationTokenExpiresAt',
]

const LEGACY_AUTH_SESSION_COLLECTIONS = ['auth_sessions', 'authsessions']
const applyChanges = process.argv.includes('--apply')

function readEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env')

  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing .env file at ${envPath}`)
  }

  return fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith('#')) return env

      const separatorIndex = trimmedLine.indexOf('=')
      if (separatorIndex === -1) return env

      const key = trimmedLine.slice(0, separatorIndex).trim()
      const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^["']|["']$/g, '')

      return { ...env, [key]: value }
    }, {})
}

function getRequiredEnv(env, key) {
  const value = env[key]

  if (!value) {
    throw new Error(`Missing required env value: ${key}`)
  }

  return value
}

function getMongoUri(env) {
  const login = encodeURIComponent(getRequiredEnv(env, 'MONGO_LOGIN'))
  const password = encodeURIComponent(getRequiredEnv(env, 'MONGO_PASSWORD'))
  const protocol = getRequiredEnv(env, 'MONGO_PROTOCOL')
  const host = getRequiredEnv(env, 'MONGO_HOST')
  const db = getRequiredEnv(env, 'MONGO_DB')
  const options = getRequiredEnv(env, 'MONGO_OPTIONS')

  return `${protocol}://${login}:${password}@${host}/${db}?${options}`
}

async function dropLegacyUserIndexes(usersCollection) {
  const indexes = await usersCollection.indexes()
  const legacyIndexNames = indexes
    .filter((index) =>
      Object.keys(index.key ?? {}).some((field) =>
        ['googleId', 'githubId'].includes(field),
      ),
    )
    .map((index) => index.name)
    .filter(Boolean)

  if (!legacyIndexNames.length) {
    console.log('No legacy user indexes found.')
    return
  }

  if (!applyChanges) {
    console.log(
      `Dry run: would drop legacy user indexes: ${legacyIndexNames.join(', ')}`,
    )
    return
  }

  for (const indexName of legacyIndexNames) {
    await usersCollection.dropIndex(indexName)
    console.log(`Dropped legacy user index: ${indexName}`)
  }
}

async function unsetLegacyUserFields(usersCollection) {
  const legacyFieldFilter = {
    $or: LEGACY_USER_FIELDS.map((field) => ({ [field]: { $exists: true } })),
  }

  const usersWithLegacyFields = await usersCollection.countDocuments(
    legacyFieldFilter,
  )

  if (!usersWithLegacyFields) {
    console.log('No users with legacy auth fields found.')
    return
  }

  const unsetPayload = LEGACY_USER_FIELDS.reduce(
    (payload, field) => ({ ...payload, [field]: '' }),
    {},
  )

  if (!applyChanges) {
    console.log(
      `Dry run: would unset legacy auth fields on ${usersWithLegacyFields} users.`,
    )
    return
  }

  const result = await usersCollection.updateMany(legacyFieldFilter, {
    $unset: unsetPayload,
  })

  console.log(`Unset legacy auth fields on ${result.modifiedCount} users.`)
}

async function dropLegacyAuthSessionCollections(db) {
  const collections = await db.listCollections().toArray()
  const collectionNames = new Set(
    collections.map((collection) => collection.name),
  )

  for (const collectionName of LEGACY_AUTH_SESSION_COLLECTIONS) {
    if (!collectionNames.has(collectionName)) {
      console.log(`Legacy collection not found: ${collectionName}`)
      continue
    }

    if (!applyChanges) {
      console.log(`Dry run: would drop legacy collection: ${collectionName}`)
      continue
    }

    await db.dropCollection(collectionName)
    console.log(`Dropped legacy collection: ${collectionName}`)
  }
}

async function main() {
  const env = readEnvFile()
  const mongoUri = getMongoUri(env)

  console.log(
    applyChanges
      ? 'Applying auth simplification cleanup.'
      : 'Running auth simplification cleanup in dry-run mode.',
  )

  await mongoose.connect(mongoUri)

  const db = mongoose.connection.db

  if (!db) {
    throw new Error('MongoDB connection did not expose a database handle.')
  }

  const usersCollection = db.collection('users')

  await dropLegacyUserIndexes(usersCollection)
  await unsetLegacyUserFields(usersCollection)
  await dropLegacyAuthSessionCollections(db)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
