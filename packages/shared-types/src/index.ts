export interface PlaceWithId {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longtitude: number;
  biome: number;
  description: number;
  imageUrl: number;
}

export type Place = Omit<PlaceWithId, "id">;
