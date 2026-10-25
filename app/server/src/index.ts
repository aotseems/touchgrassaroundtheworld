import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";
import {
  initDatabase,
  getAllGrasses,
  getGrassesCount,
  getGrassById,
  addGrass,
  seedDatabase,
} from "./database";
import { getRandomByValue } from "./random";
import { GrassWithoutId } from "./grass";

// The path to database should not be hardcoded.
const db = initDatabase("database.db");

// Try seeding the database.
seedDatabase(db);

const app = express();
const port = 3000;
app.use(express.json());

// CORS middleware
app.use(cors());

// We list all of the available grasses here.
app.get("/api/grasses", (_req: Request, res: Response) => {
  try {
    const grasses = getAllGrasses(db);
    res.status(200).json(grasses);
  } catch (err: any) {
    console.error(err.message);
    res.status(500);
  }
});

app.get("/api/grass-by-id", (req: Request, res: Response) => {
  try {
    const id = req.query.id ? parseInt(req.query.id as string, 10) : 0;
    const grass = getGrassById(db, id);
    if (!grass) {
      res.status(404).json({ error: "Grass not found" });
      return;
    }
    res.status(200).json(grass);
  } catch (err: any) {
    res.status(404).json({ error: "Grass not found" });
  }
});

// Admins and community can add new grasses here.
app.post("/api/grasses", (req: Request, res: Response) => {
  const grass = req.body as GrassWithoutId;
  addGrass(db, grass);
  res.status(200);
});

app.get("/api/grass-of-the-day", (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();

    const randomId = year + month + date;
    const grassesCount = getGrassesCount(db);
    const grassId = getRandomByValue(1, grassesCount, randomId);

    const randomGrass = getGrassById(db, grassId);

    res.status(200).json(randomGrass);
  } catch (err: any) {
    console.error(err.message);
    res.status(500);
  }
});

const clientDistPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));

app.get("/{*splat}", (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
