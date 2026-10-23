import { useState, useEffect } from "react";
import axios from "axios";

interface PlaceWithId {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longtitude: number;
  biome: number;
  description: number;
  imageUrl: string;
}

type Place = Omit<PlaceWithId, "id">;

export default function App() {
  const [testplace, SetPlace] = useState<Place>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Place[]>("http://localhost:3000/places");
        setPlaces(res.data);
        
        const testres = await axios.get<Place>("http://localhost:3000/grass-of-the-day");
        SetPlace(testres.data);
        
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>An error occured: {error}</p>;

  return (
    <div>
      <h1>Touch Grass Around The World</h1>
      <section>
        <div>
          {places.map((place) => (
            <div key={place.name}>
              <h2>{place.name}</h2>
              <img src={place.imageUrl}></img>
              <h3>{place.location}</h3>
              <p>{place.description}</p>
            </div>
          ))}
        </div>
        <div>
          {
            <h2>{"Testing the place of the day: " + testplace?.name}</h2>
          }
        </div>
      </section>
    </div>
  );
}
