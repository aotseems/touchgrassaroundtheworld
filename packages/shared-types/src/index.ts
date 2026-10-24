export interface PlaceWithId {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  biome: number;
  brief: string;
  description: string;
  imageUrl: number;
}

export type Place = Omit<PlaceWithId, "id">;
