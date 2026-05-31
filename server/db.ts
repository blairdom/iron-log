import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_data (
      id INTEGER PRIMARY KEY DEFAULT 1,
      sessions JSONB NOT NULL DEFAULT '[]',
      cardio_sessions JSONB NOT NULL DEFAULT '[]',
      program JSONB,
      adherence_records JSONB NOT NULL DEFAULT '[]',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    INSERT INTO app_data (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
  `);
  console.log("Database initialized");
}

export async function loadData() {
  const result = await pool.query("SELECT * FROM app_data WHERE id = 1");
  return result.rows[0] ?? null;
}

export async function saveData(data: {
  sessions?: unknown;
  cardio_sessions?: unknown;
  program?: unknown;
  adherence_records?: unknown;
}) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (data.sessions !== undefined)          { fields.push(`sessions = $${i++}`);          values.push(JSON.stringify(data.sessions)); }
  if (data.cardio_sessions !== undefined)   { fields.push(`cardio_sessions = $${i++}`);   values.push(JSON.stringify(data.cardio_sessions)); }
  if (data.program !== undefined)           { fields.push(`program = $${i++}`);           values.push(JSON.stringify(data.program)); }
  if (data.adherence_records !== undefined) { fields.push(`adherence_records = $${i++}`); values.push(JSON.stringify(data.adherence_records)); }

  if (fields.length === 0) return;

  fields.push(`updated_at = NOW()`);
  values.push(1); // WHERE id = $n

  await pool.query(
    `UPDATE app_data SET ${fields.join(", ")} WHERE id = $${i}`,
    values
  );
}
