import { v4 as uuidv4 } from "uuid";
import Entity from "./Entity";
import type { System } from "./Systems/System";

export default class World {
  private _entities: Entity[] = [];
  private _systems: System[] = [];

  public registerSystem(system: any): void {
    this._systems.push(system);
  }

  public createEntity(): Entity {
    const entity = new Entity(uuidv4());
    this._entities.push(entity);
    return entity;
  }

  public getAllEntities(): Entity[] {
    return this._entities;
  }

  public tick(): void {
    for (const system of this._systems) {
      system.tick();
    }
  }
}
