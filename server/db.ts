import { Pool } from "pg";

// ── Server-side program migration ─────────────────────────────────────────────
// Old KB exercise IDs that shipped in TUE/THU before the v2 update
const LEGACY_IDS = new Set(["ex-033", "ex-052", "ex-053", "ex-054", "ex-027"]);

const NEW_TUE = {
  key: "tue", label: "TUE", name: "CORE + GLUTE STABILITY", scheduled: true,
  sections: [
    { id: "tue-s1", name: "Glutes", slots: [
      { id: "tue-s1-1", bodyPart: "Glutes", subTarget: "Glutes",        movementPattern: "Hip Extension", selectedExerciseId: "ex-062", defaultSets: [{reps:12,weight:0,unit:"bw"},{reps:12,weight:0,unit:"bw"},{reps:12,weight:0,unit:"bw"}], restSeconds: 60 },
      { id: "tue-s1-2", bodyPart: "Glutes", subTarget: "Hip Abductors", movementPattern: "Abduction",     selectedExerciseId: "ex-063", defaultSets: [{reps:15,weight:0,unit:"bw"},{reps:15,weight:0,unit:"bw"}], restSeconds: 60 },
      { id: "tue-s1-3", bodyPart: "Glutes", subTarget: "Hip Abductors", movementPattern: "Abduction",     selectedExerciseId: "ex-064", defaultSets: [{reps:12,weight:0,unit:"bw"},{reps:12,weight:0,unit:"bw"}], restSeconds: 60 },
    ]},
    { id: "tue-s2", name: "Core", slots: [
      { id: "tue-s2-1", bodyPart: "Core", subTarget: "Core Stability",    movementPattern: "Extension", selectedExerciseId: "ex-065", defaultSets: [{reps:8,weight:0,unit:"bw"},{reps:8,weight:0,unit:"bw"}],   restSeconds: 60 },
      { id: "tue-s2-2", bodyPart: "Core", subTarget: "Core (Transverse)", movementPattern: "Extension", selectedExerciseId: "ex-041", defaultSets: [{reps:8,weight:0,unit:"bw"},{reps:8,weight:0,unit:"bw"}],   restSeconds: 60 },
      { id: "tue-s2-3", bodyPart: "Core", subTarget: "Core (Transverse)", movementPattern: "Extension", selectedExerciseId: "ex-040", defaultSets: [{reps:30,weight:0,unit:"bw"},{reps:30,weight:0,unit:"bw"}], restSeconds: 60 },
    ]},
    { id: "tue-s3", name: "Balance", slots: [
      { id: "tue-s3-1", bodyPart: "Balance", subTarget: "Hip Stability", movementPattern: "Balance", selectedExerciseId: "ex-067", defaultSets: [{reps:20,weight:0,unit:"bw"},{reps:20,weight:0,unit:"bw"}], restSeconds: 45 },
    ]},
  ],
};

const NEW_THU = {
  key: "thu", label: "THU", name: "RECOVERY + HIP STABILITY", scheduled: true,
  sections: [
    { id: "thu-s1", name: "Hip Stability", slots: [
      { id: "thu-s1-1", bodyPart: "Glutes", subTarget: "Glutes",        movementPattern: "Hip Extension", selectedExerciseId: "ex-062", defaultSets: [{reps:12,weight:0,unit:"bw"},{reps:12,weight:0,unit:"bw"}], restSeconds: 60 },
      { id: "thu-s1-2", bodyPart: "Glutes", subTarget: "Hip Abductors", movementPattern: "Abduction",     selectedExerciseId: "ex-063", defaultSets: [{reps:12,weight:0,unit:"bw"},{reps:12,weight:0,unit:"bw"}], restSeconds: 60 },
      { id: "thu-s1-3", bodyPart: "Glutes", subTarget: "Hip Abductors", movementPattern: "Abduction",     selectedExerciseId: "ex-064", defaultSets: [{reps:10,weight:0,unit:"bw"},{reps:10,weight:0,unit:"bw"}], restSeconds: 60 },
    ]},
    { id: "thu-s2", name: "Core Stability", slots: [
      { id: "thu-s2-1", bodyPart: "Core", subTarget: "Core Stability", movementPattern: "Extension", selectedExerciseId: "ex-065", defaultSets: [{reps:6,weight:0,unit:"bw"},{reps:6,weight:0,unit:"bw"}],   restSeconds: 60 },
      { id: "thu-s2-2", bodyPart: "Core", subTarget: "Obliques",       movementPattern: "Extension", selectedExerciseId: "ex-066", defaultSets: [{reps:20,weight:0,unit:"bw"},{reps:20,weight:0,unit:"bw"}], restSeconds: 60 },
    ]},
    { id: "thu-s3", name: "Mobility", slots: [
      { id: "thu-s3-1", bodyPart: "Mobility", subTarget: "Hip Mobility", movementPattern: "Mobility", selectedExerciseId: "ex-068", defaultSets: [{reps:300,weight:0,unit:"bw"}], restSeconds: 45 },
    ]},
  ],
};

const NEW_SAT = {
  key: "sat", label: "SAT", name: "CORE + GLUTES", scheduled: true,
  sections: [
    { id: "sat-s1", name: "Glutes", slots: [
      { id: "sat-s1-1", bodyPart: "Glutes", subTarget: "Glutes",        movementPattern: "Hip Extension", selectedExerciseId: "ex-062", defaultSets: [{reps:15,weight:0,unit:"bw"},{reps:15,weight:0,unit:"bw"},{reps:15,weight:0,unit:"bw"}], restSeconds: 60 },
      { id: "sat-s1-2", bodyPart: "Glutes", subTarget: "Hip Abductors", movementPattern: "Abduction",     selectedExerciseId: "ex-063", defaultSets: [{reps:15,weight:0,unit:"bw"},{reps:15,weight:0,unit:"bw"}], restSeconds: 60 },
      { id: "sat-s1-3", bodyPart: "Glutes", subTarget: "Hip Abductors", movementPattern: "Abduction",     selectedExerciseId: "ex-064", defaultSets: [{reps:12,weight:0,unit:"bw"},{reps:12,weight:0,unit:"bw"}], restSeconds: 60 },
    ]},
    { id: "sat-s2", name: "Core", slots: [
      { id: "sat-s2-1", bodyPart: "Core", subTarget: "Core (Transverse)", movementPattern: "Extension", selectedExerciseId: "ex-041", defaultSets: [{reps:10,weight:0,unit:"bw"},{reps:10,weight:0,unit:"bw"}], restSeconds: 60 },
      { id: "sat-s2-2", bodyPart: "Core", subTarget: "Core Stability",    movementPattern: "Extension", selectedExerciseId: "ex-065", defaultSets: [{reps:8,weight:0,unit:"bw"},{reps:8,weight:0,unit:"bw"}],   restSeconds: 60 },
      { id: "sat-s2-3", bodyPart: "Core", subTarget: "Core (Transverse)", movementPattern: "Extension", selectedExerciseId: "ex-040", defaultSets: [{reps:30,weight:0,unit:"bw"},{reps:30,weight:0,unit:"bw"}], restSeconds: 60 },
      { id: "sat-s2-4", bodyPart: "Core", subTarget: "Obliques",          movementPattern: "Extension", selectedExerciseId: "ex-066", defaultSets: [{reps:20,weight:0,unit:"bw"},{reps:20,weight:0,unit:"bw"}], restSeconds: 60 },
    ]},
    { id: "sat-s3", name: "Balance", slots: [
      { id: "sat-s3-1", bodyPart: "Balance", subTarget: "Hip Stability", movementPattern: "Balance", selectedExerciseId: "ex-067", defaultSets: [{reps:20,weight:0,unit:"bw"},{reps:20,weight:0,unit:"bw"}], restSeconds: 45 },
    ]},
  ],
};

function isLegacyDay(day: any): boolean {
  return day?.sections?.some((sec: any) =>
    sec?.slots?.some((slot: any) => LEGACY_IDS.has(slot?.selectedExerciseId))
  ) ?? false;
}

function migrateProgram(program: any[]): { program: any[]; changed: boolean } {
  let changed = false;
  const result = program.map((day: any) => {
    if ((day.key === "tue" || day.key === "thu") && isLegacyDay(day)) {
      changed = true;
      return day.key === "tue" ? NEW_TUE : NEW_THU;
    }
    if (day.key === "sat" && (!day.scheduled || day.sections?.length === 0)) {
      changed = true;
      return NEW_SAT;
    }
    return day;
  });
  return { program: result, changed };
}

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
  const row = result.rows[0] ?? null;
  if (!row) return row;

  // Migrate legacy KB program if still stored in Postgres
  if (Array.isArray(row.program)) {
    const { program, changed } = migrateProgram(row.program);
    if (changed) {
      await pool.query(
        "UPDATE app_data SET program = $1, updated_at = NOW() WHERE id = 1",
        [JSON.stringify(program)]
      );
      row.program = program;
      console.log("Migrated legacy TUE/THU/SAT program in Postgres");
    }
  }

  return row;
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
