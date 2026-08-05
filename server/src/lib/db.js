import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

export function query(text, params) {
  return pool.query(text, params);
}

export function close() {
  return pool.end();
}
