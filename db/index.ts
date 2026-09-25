import net from "node:net"
import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"
import * as schema from "./schema"

// Prevent Node.js from attempting unreachable IPv6 before IPv4, avoiding ETIMEDOUT
if (typeof (net as unknown as { setDefaultAutoSelectFamily?: (val: boolean) => void }).setDefaultAutoSelectFamily === "function") {
  (net as unknown as { setDefaultAutoSelectFamily: (val: boolean) => void }).setDefaultAutoSelectFamily(false)
}

// Use WebSocket instead of HTTP — works in Node.js dev/prod environments
// where the HTTP fetch path is blocked. This is the same transport
// drizzle-kit uses for migrations.
neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

export const db = drizzle(pool, { schema })

export type DB = typeof db

