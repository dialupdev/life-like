export type Component = object;

type Alive = Record<string, never>;

interface Position {
  x: number;
  y: number;
}

export enum ComponentKey {
  Alive = "Alive",
  Position = "Position",
}

export interface ComponentMap {
  [ComponentKey.Alive]: Alive;
  [ComponentKey.Position]: Position;
}
