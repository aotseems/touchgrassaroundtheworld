import { Grass, GrassWithoutId } from "./grass";
import Database from "better-sqlite3";
import BetterSqlite3 from "better-sqlite3";
import { starterGrasses } from "./starter-grasses";

function formatRow(row: any): Grass {
  if (!row) return row;
  let sources: string[] = [];
  if (Array.isArray(row.sources)) {
    sources = row.sources;
  } else if (typeof row.sources === "string") {
    try {
      const parsed = JSON.parse(row.sources);
      sources = Array.isArray(parsed) ? parsed : [];
    } catch {
      sources = row.sources ? [row.sources] : [];
    }
  }
  return {
    ...row,
    sources,
  };
}

export function initDatabase(path: string): BetterSqlite3.Database {
  const db = new Database(path);
  db.exec(
    `CREATE TABLE IF NOT EXISTS grasses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      biome TEXT NOT NULL,
      brief TEXT NOT NULL,
      description TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      sources TEXT DEFAULT '[]'
    );`,
  );

  try {
    db.exec(`ALTER TABLE grasses ADD COLUMN sources TEXT DEFAULT '[]';`);
  } catch {
    // Column already exists
  }

  return db;
}

export function getAllGrasses(db: BetterSqlite3.Database): Grass[] {
  const query = db.prepare<[], any>("SELECT * FROM grasses");
  return query.all().map(formatRow);
}

export function seedDatabase(db: BetterSqlite3.Database) {
  if (getAllGrasses(db).length !== 0) return;

  const insertion = db.prepare(
    `INSERT INTO grasses (name, location, latitude, longitude, biome, brief, description, imageUrl, sources)
    VALUES (@name, @location, @latitude, @longitude, @biome, @brief, @description, @imageUrl, @sources)`,
  );
  starterGrasses.forEach((grass) => {
    insertion.run({
      ...grass,
      sources: JSON.stringify(grass.sources || []),
    });
  });
}

export function getGrassesCount(db: BetterSqlite3.Database): number {
  const query = db
    .prepare("SELECT MAX(id) AS max_id FROM grasses")
    .get() as any;
  const maxid = query?.max_id ?? 0;

  return maxid;
}

export function getGrassById(db: BetterSqlite3.Database, id: number): Grass {
  const query = db.prepare("SELECT * FROM grasses WHERE id = ?");
  const row = query.get(id);
  return formatRow(row);
}

export function addGrass(db: BetterSqlite3.Database, grass: GrassWithoutId) {
  const insertion = db.prepare(
    `INSERT INTO grasses (name, location, latitude, longitude, biome, brief, description, imageUrl, sources)
    VALUES (@name, @location, @latitude, @longitude, @biome, @brief, @description, @imageUrl, @sources)`,
  );
  insertion.run({
    ...grass,
    sources: JSON.stringify(grass.sources || []),
  });
}
