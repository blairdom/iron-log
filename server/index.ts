import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDb, loadData, saveData } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ── API routes ──────────────────────────────────────────────────────────────

// GET all data — called on app startup to hydrate state
app.get("/api/data", async (_req, res) => {
  try {
    const data = await loadData();
    res.json(data ?? {});
  } catch (err) {
    console.error("GET /api/data error:", err);
    res.status(500).json({ error: "Failed to load data" });
  }
});

// PATCH specific keys — called after any state mutation
app.patch("/api/data", async (req, res) => {
  try {
    await saveData(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/data error:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

// ── Serve frontend ──────────────────────────────────────────────────────────
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// Catch-all: serve index.html for client-side routing
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ── Start ───────────────────────────────────────────────────────────────────
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Iron Log server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
