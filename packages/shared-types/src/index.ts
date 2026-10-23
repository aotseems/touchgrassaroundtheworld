export interface PlaceWithID {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longtitude: number;
  biome: number;
  description: number;
  imgaeUrl: number;
}

export type Place = Omit<PlaceWithID, "id">;
