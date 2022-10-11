import { v4 as uuidv4 } from "uuid";
import Entity from "./Entity";
import { ComponentKey } from "./Components";
import type { System } from "./Systems/System";
import { isNeighbor } from "./utils/NeighborUtils";

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

  public getLivingEntities(): Entity[] {
    return this._entities.filter(entity => entity.hasComponent(ComponentKey.Alive));
  }

  public getNeighborEntities(entity: Entity): Entity[] {
    return this._entities.filter(otherEntity => {
      return isNeighbor(entity, otherEntity);
    });
  }

  public tick(): void {
    for (const system of this._systems) {
      system.tick();
    }
  }
}
