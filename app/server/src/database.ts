import { Grass, GrassWithoutId } from "@repo/shared-types";
import Database from "better-sqlite3";
import BetterSqlite3 from "better-sqlite3";

const starterPlaces: GrassWithoutId[] = [
  {
    name: "Alpine meadow",
    location: "Dolomites, Italy",
    latitude: 46.433334,
    longitude: 11.85,
    biome: "Alpine",
    brief: "A soft, high-altitude mix of wildflowers and cool-season grasses.",
    description:
      "The beauty and diversity of the landscape of the Italian Dolomites alone will enchant you - in every season. Because this holiday region always has its own unique and irresistible appeal. The only question remaining is what not to miss during an Italian Dolomites holiday. One of the Christmas markets in winter or Braies lake in summer? One of the Messner Mountain museums for culture fans? The land of the Dolomites is diverse ... a small patch of earth where you will find everything to make your holiday a perfect experience.",
    imageUrl:
      "https://media.cntraveller.com/photos/660e83496c06875aa976de49/16:9/w_768,c_limit/dolomites-GettyImages-155382713.jpeg",
    sources: [
      "https://www.dolomiti.org",
      "https://www.suedtirol.info/en",
    ],
  },
  {
    name: "Emerald fescue",
    location: "Lake District, England",
    latitude: 54.5,
    longitude: -3.1667,
    biome: "Temperate",
    brief: "Velvety green fescue carpeting the quiet paths of the fells.",
    description:
      "With stunning mountain views, lovely beaches and shimmering lakes galore, summer is a great time of year to visit the Lake District, Cumbria. Enjoy captivating exhibitions at a great range of museums and art galleries and choose from a vibrant array of events at our brilliant selection of theatres and cinemas. You’ll find ancient castles, historic ruins, old burial sites and stone circles dotted across the region.",
    imageUrl:
      "https://media.cntraveller.com/photos/67d850dd4050ea7aa4b21860/1:1/w_2000,h_2000,c_limit/Buttermere-Lake-District-March25-PR-visitlakedistrict.com-Global.jpg",
    sources: [
      "https://www.lakedistrict.gov.uk",
      "https://www.visitlakedistrict.com",
    ],
  },
  {
    name: "Pampas grass",
    location: "Patagonia, Argentina",
    latitude: -44,
    longitude: -68,
    biome: "Steppe",
    brief:
      "Resilient tussock grass shaped by the winds of the southern steppe.",
    description:
      'Patagonia (South Patagonia) is a geographical region in Argentina, located to the south of the Rio Colorado River. It is a magnificent region of pristine nature with picturesque pampas, majestic glaciers, crystal clear lakes, and grand canyons. In the Argentinean part of Patagonia, there is a unique "Glaciers Park." The famous Perito Moreno, the largest glacier in South America, is located there. The territory of the region is a real paradise for fans of natural attractions and active recreation. Spectacular cruises along the picturesque bays, excursions to national parks, acquaintances with original cities, and Argentina\'s mysterious places are waiting for them. Southern Patagonia attracts with its extraordinary beauty, fantastic views, and a great variety of unique natural wonders.',
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SDqEwI8VS0FP2grlQkKeZkFCd7kBko5CZQybMp0lVzylyfEJD5mxckrS8E-2UUb4DMSSllRQbzmVwH3R2ra3UpFCRYWaJvFd0yy9qguWDLqL8--XmAkJmNdMFeqHuR1wBJrymihLyb3Cs=s1360-w1360-h1020-rw",
    sources: [
      "https://www.argentina.travel/en",
      "https://www.parquesnacionales.gob.ar",
    ],
  },
  {
    name: "Mossy forest floor",
    location: "Olympic National Park, USA",
    latitude: 47.9691,
    longitude: -123.4983,
    biome: "Temperate rainforest",
    brief: "A lush, living understory tucked beneath ancient evergreen trees.",
    description:
      "Wander past waterfalls under a canopy of old-growth trees. Cast a line for something wild. Dip your paddle in deep waters or rushing rivers, or soak in some serenity in a hot-springs pool. From pristine beaches to untouched wilderness, you can experience some of the most scenic and popular destinations in the country, or opt for your own unique adventure off the beaten path.",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQytThl75fexRfm3_6sXA03LVo5MzRZ5hLtq9PXlXdB53_LgpnHHE4lRfDU&s=10",
    sources: [
      "https://www.nps.gov/olym",
      "https://olympicpeninsula.org",
    ],
  },
];

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
  starterPlaces.forEach((place) => {
    insertion.run({
      ...place,
      sources: JSON.stringify(place.sources || []),
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