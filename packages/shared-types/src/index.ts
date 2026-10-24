export interface Grass {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  biome: string;
  brief: string;
  description: string;
  imageUrl: string;
  sources: string[];
}

export type GrassWithoutId = Omit<Grass, "id">;
