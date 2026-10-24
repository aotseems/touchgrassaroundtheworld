import { Place } from "@repo/shared-types";
import Database from "better-sqlite3";
import BetterSqlite3 from "better-sqlite3";

const starterPlaces: Place[] = [
  {
    name: "Alpine meadow",
    location: "Dolomites, Italy",
    latitude: 46.433334,
    longitude: 11.85,
    biome: "Alpine",
    brief: "A soft, high-altitude mix of wildflowers and cool-season grasses.",
    description: "",
    imageUrl:
      "https://media.cntraveller.com/photos/660e83496c06875aa976de49/16:9/w_768,c_limit/dolomites-GettyImages-155382713.jpeg",
  },
  {
    name: "Emerald fescue",
    location: "Lake District, England",
    latitude: 54.5,
    longitude: -3.1667,
    biome: "Temperate",
    brief: "Velvety green fescue carpeting the quiet paths of the fells.",
    description: "",
    imageUrl:
      "https://media.cntraveller.com/photos/67d850dd4050ea7aa4b21860/1:1/w_2000,h_2000,c_limit/Buttermere-Lake-District-March25-PR-visitlakedistrict.com-Global.jpg",
  },
  {
    name: "Pampas grass",
    location: "Patagonia, Argentina",
    latitude: -44,
    longitude: -68,
    biome: "Steppe",
    brief:
      "Resilient tussock grass shaped by the winds of the southern steppe.",
    description: "",
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SDqEwI8VS0FP2grlQkKeZkFCd7kBko5CZQybMp0lVzylyfEJD5mxckrS8E-2UUb4DMSSllRQbzmVwH3R2ra3UpFCRYWaJvFd0yy9qguWDLqL8--XmAkJmNdMFeqHuR1wBJrymihLyb3Cs=s1360-w1360-h1020-rw",
  },
  {
    name: "Mossy forest floor",
    location: "Olympic National Park, USA",
    latitude: 47.9691,
    longitude: -123.4983,
    biome: "Temperate rainforest",
    brief: "A lush, living understory tucked beneath ancient evergreen trees.",
    description: "",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQytThl75fexRfm3_6sXA03LVo5MzRZ5hLtq9PXlXdB53_LgpnHHE4lRfDU&s=10",
  },
];

export function initDatabase(path: string): BetterSqlite3.Database {
  const db = new Database(path);
  db.exec(
    `CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      biome TEXT NOT NULL,
      brief TEXT NOT NULL,
      description TEXT NOT NULL,
      imageUrl TEXT NOT NULL
    );`,
  );
  return db;
}

export function getAllPlaces(db: BetterSqlite3.Database): Place[] {
  const query = db.prepare<[], Place>(
    "SELECT name, location, latitude, longitude, biome, brief, description, imageUrl FROM places",
  );
  return query.all();
}

export function seedDatabase(db: BetterSqlite3.Database) {
  if (getAllPlaces(db).length !== 0) return;

  const insertion = db.prepare(
    `INSERT INTO places (name, location, latitude, longitude, biome, brief, description, imageUrl)
    VALUES (@name, @location, @latitude, @longitude, @biome, @brief, @description, @imageUrl)`,
  );
  starterPlaces.forEach((place) => {
    insertion.run(place);
  });
}

export function getTotalPlaces(db: BetterSqlite3.Database): number {
  const query = db.prepare("SELECT MAX(id) AS max_id FROM places").get() as any;
  const maxid = query?.max_id ?? 0;

  return maxid;
}

export function getPlaceById(db: BetterSqlite3.Database, id: number): Place {
  const query = db.prepare(
    "SELECT name, location, latitude, longitude, biome, brief, description, imageUrl FROM places WHERE id = ?",
  );
  return query.get(id);
}

export function addPlace(db: BetterSqlite3.Database, place: Place) {
  const insertion = db.prepare(
    `INSERT INTO places (name, location, latitude, longitude, biome, brief, description, imageUrl)
    VALUES (@name, @location, @latitude, @longitude, @biome, @brief, @description, @imageUrl)`,
  );
  insertion.run(place);
}
