import express, { Request, Response } from "express";
import Database from "better-sqlite3";
import { Place } from "@repo/shared-types";

// The path to database should not be hardcoded.
const db = new Database("database.db");
db.exec(
  `CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude REAL NOT NULL,
    longtitude REAL NOT NULL,
    biome TEXT NOT NULL,
    description TEXT NOT NULL,
    imageUrl TEXT NOT NULL
  );`,
);

// Try populating the database for testing purposes.
const insertion = db.prepare(
  `INSERT INTO places (name, location, latitude, longtitude, biome, description, imageUrl)
  VALUES (@name, @location, @latitude, @longtitude, @biome, @description, @imageUrl)`,
);
insertion.run({
  name: "Stonehenge Grass",
  location: "Salisbury Plain, Wiltshire, England",
  latitude: 51.178889,
  longtitude: -1.826111,
  biome: "Temporal Broadleaf",
  description: "Bruh",
  imageUrl:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/330px-Stonehenge2007_07_30.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail",
});

const app = express();
const port = 3000;
app.use(express.json());

// We list all of the available grasses here.
app.get("/places", (_req: Request, res: Response) => {
  try {
    const query = db.prepare<[], Place>(
      "SELECT name, location, latitude, longtitude, biome, description, imageUrl FROM places",
    );
    const places: Place[] = query.all();
    res.status(200).json(places);
  } catch (err: any) {
    console.error(err.message);
    res.status(500);
  }
});

// Admins and community can add new grasses here.
app.post("/places", (req: Request, res: Response) => {
  // TODO:
  res.status(503);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
