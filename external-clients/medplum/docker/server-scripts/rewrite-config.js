// Rewrite the config file with the correct database and redis connection strings
// ONLY WORKS FOR PROD!
// For local, run
//   deno task medplum:server

// deno-lint-ignore-file no-node-globals
const assert = require('assert')

const DATABASE_URL = process.env.DATABASE_URL
const REDISCLOUD_URL = process.env.REDISCLOUD_URL
assert.ok(DATABASE_URL, 'DATABASE_URL must be set as environment variable')
assert.ok(REDISCLOUD_URL, 'REDISCLOUD_URL must be set as environment variable')

function parseDBConnectionString(connectionString) {
  const regex =
    /^postgres:\/\/(?:(.*?)(?::(.*?))?@)?(.*):(\d+)\/(\w*)?(\?sslmode=require)?$/
  const match = connectionString.match(regex)

  assert.ok(match, 'Invalid postgres connection string format.')

  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    dbname: match[5],
    ssl: match[6] ? { require: true, rejectUnauthorized: false } : undefined,
  }
}

function parseRedisConnectionString(
  connectionString,
) {
  const regex = /^redis:\/\/(?:(.*?)(?::(.*?))?@)?(.*):(\d+)\/?$/
  const match = connectionString.match(regex)

  assert.ok(match, 'Invalid Redis connection string format.')

  return {
    username: match[1],
    password: match[2],
    hostname: match[3],
    port: parseInt(match[4], 10),
  }
}

let input = ''

// Read from stdin
process.stdin.on('data', (chunk) => {
  input += chunk
})

// When input ends (EOF), process the input
process.stdin.on('end', () => {
  const medplum_config = JSON.parse(input)

  const redis_opts = parseRedisConnectionString(REDISCLOUD_URL)
  const db_opts = parseDBConnectionString(DATABASE_URL)

  const vha_medplum_config = {
    ...medplum_config,
    database: {
      ...db_opts,
      ssl: true,
    },
    redis: {
      ...redis_opts,
      host: redis_opts.hostname,
    },
    logRequests: true,
  }

  console.log(JSON.stringify(vha_medplum_config, null, 2))
})
