import express, { Request, Response } from "express";
import cors from "cors";
import {
  initDatabase,
  getAllPlaces,
  getTotalPlaces,
  getPlaceById,
  addPlace,
  seedDatabase,
} from "./database";
import { getRandomByValue } from "./random";

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
app.get("/places", (_req: Request, res: Response) => {
  try {
    const places = getAllPlaces(db);
    res.status(200).json(places);
  } catch (err: any) {
    console.error(err.message);
    res.status(500);
  }
});

// Admins and community can add new grasses here.
app.post("/places", (req: Request, res: Response) => {
  const place = req.body as Place;
  addPlace(db, place);
  res.status(200);
});

app.get("/grass-of-the-day", (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();

    const randomvalue = year + month + date;
    const totalplaces = getTotalPlaces(db);
    const placeid = getRandomByValue(0, totalplaces, randomvalue);

    const randomrow = getPlaceById(placeid);

    res.status(200).json(randomrow);
  } catch (err: any) {
    console.error(err.message);
    res.status(500);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
