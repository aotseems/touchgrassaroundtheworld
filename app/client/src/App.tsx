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
  imgaeUrl: number;
}

type Place = Omit<PlaceWithId, "id">;

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/places");
        setPlaces(res.data);
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
      {places.map((place) => (
        <div>
          <h2>{place.name}</h2>
          <img src={place.imageUrl}></img>
          <h3>{place.location}</h3>
          <p>{place.description}</p>
        </div>
      ))}
    </div>
  );
}
