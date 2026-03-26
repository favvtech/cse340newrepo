const { Pool } = require("pg")
require("dotenv").config()

/* Normalize NODE_ENV (dotenv sometimes keeps quotes in .env values) */
const nodeEnv = String(process.env.NODE_ENV || "")
  .replace(/^['"]|['"]$/g, "")
  .trim()
const isDevelopment = nodeEnv === "development"

/*
 * Remote hosts (for example Render) expect TLS from your laptop.
 * If NODE_ENV is not exactly "development", the old code skipped ssl and
 * connections could fail with ECONNRESET.
 */
function dbNeedsSsl() {
  const url = process.env.DATABASE_URL || ""
  if (/sslmode=require/i.test(url)) return true
  if (/render\.com|neon\.tech|supabase\.co|amazonaws\.com/i.test(url))
    return true
  return isDevelopment
}

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
}

if (dbNeedsSsl()) {
  poolConfig.ssl = { rejectUnauthorized: false }
}

let pool = new Pool(poolConfig)

/* During development, log queries. Export a small wrapper for consistency. */
if (isDevelopment) {
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (error) {
        console.error("error in query", { text })
        throw error
      }
    },
  }
} else {
  module.exports = pool
}