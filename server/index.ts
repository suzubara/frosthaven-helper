import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();
const PORT = 3001;
const SCENARIOS_DIR = path.resolve("game-data/scenarios");
const CAMPAIGNS_DIR = path.resolve("game-data/campaigns");

app.use(express.json());

// --- CRUD helper factory ---

function registerCrudRoutes(prefix: string, dataDir: string, label: string) {
  // List all
  app.get(`/api/${prefix}`, async (_req, res) => {
    try {
      const files = await fs.readdir(dataDir);
      const items = await Promise.all(
        files
          .filter((f) => f.endsWith(".json"))
          .map(async (f) => {
            const content = await fs.readFile(path.join(dataDir, f), "utf-8");
            return JSON.parse(content);
          })
      );
      res.json(items);
    } catch {
      res.json([]);
    }
  });

  // Load by id
  app.get(`/api/${prefix}/:id`, async (req, res) => {
    const filePath = path.join(dataDir, `${req.params.id}.json`);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      res.json(JSON.parse(content));
    } catch {
      res.status(404).json({ error: `${label} not found` });
    }
  });

  // Create or update
  app.put(`/api/${prefix}/:id`, async (req, res) => {
    const filePath = path.join(dataDir, `${req.params.id}.json`);
    let isNew = false;
    try {
      await fs.access(filePath);
    } catch {
      isNew = true;
    }

    await fs.writeFile(filePath, JSON.stringify(req.body, null, 2), "utf-8");
    res.status(isNew ? 201 : 200).json(req.body);
  });

  // Delete
  app.delete(`/api/${prefix}/:id`, async (req, res) => {
    const filePath = path.join(dataDir, `${req.params.id}.json`);
    try {
      await fs.unlink(filePath);
      res.status(204).end();
    } catch {
      res.status(404).json({ error: `${label} not found` });
    }
  });
}

registerCrudRoutes("scenarios", SCENARIOS_DIR, "Session");
registerCrudRoutes("campaigns", CAMPAIGNS_DIR, "Campaign");

// Ensure data directories exist, then start
async function start() {
  await fs.mkdir(SCENARIOS_DIR, { recursive: true });
  await fs.mkdir(CAMPAIGNS_DIR, { recursive: true });
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start();
