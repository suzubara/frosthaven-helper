import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();
const PORT = 3001;
const DATA_DIR = path.resolve("game-data/scenarios");

app.use(express.json());

// List all saved sessions
app.get("/api/scenarios", async (_req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const sessions = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          const content = await fs.readFile(path.join(DATA_DIR, f), "utf-8");
          return JSON.parse(content);
        })
    );
    res.json(sessions);
  } catch {
    res.json([]);
  }
});

// Load a session by id
app.get("/api/scenarios/:id", async (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    res.json(JSON.parse(content));
  } catch {
    res.status(404).json({ error: "Session not found" });
  }
});

// Create or update a session
app.put("/api/scenarios/:id", async (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  let isNew = false;
  try {
    await fs.access(filePath);
  } catch {
    isNew = true;
  }

  await fs.writeFile(filePath, JSON.stringify(req.body, null, 2), "utf-8");
  res.status(isNew ? 201 : 200).json(req.body);
});

// Delete a session
app.delete("/api/scenarios/:id", async (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  try {
    await fs.unlink(filePath);
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Session not found" });
  }
});

// Ensure data directory exists, then start
async function start() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start();
