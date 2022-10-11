import World from "../World";
import Entity from "../Entity";
import { ComponentKey } from "../Components";
import type { System } from "./System";

export default class LifecycleSystem implements System {
  private _world: World;
  private _started: boolean;

  constructor(world: World) {
    this._world = world;
  }

  public tick(): void {
    // Delay system start by one frame so we can render the initial state
    if (!this._started) {
      this._started = true;
      return;
    }

    const entitiesToDie: Entity[] = [];
    const entitiesToSpawn: Entity[] = [];

    const livingEntities = this._world.getLivingEntities();

    for (const entity of livingEntities) {
      const neighbors = this._world.getNeighborEntities(entity);

      // Mark cells for death
      const livingNeighbors = neighbors.filter(neighbor => neighbor.hasComponent(ComponentKey.Alive));
      if (livingNeighbors.length < 2 || livingNeighbors.length > 3) {
        entitiesToDie.push(entity);
      }

      // Mark cells for birth
      for (const neighbor of neighbors) {
        const neighborNeighbors = this._world.getNeighborEntities(neighbor);
        const livingNeighborNeighbors = neighborNeighbors.filter(neighbor => neighbor.hasComponent(ComponentKey.Alive));
        if (livingNeighborNeighbors.length === 3) {
          entitiesToSpawn.push(neighbor);
        }
      }
    }

    for (const entityToDie of entitiesToDie) {
      entityToDie.removeComponent(ComponentKey.Alive);
    }

    for (const entityToSpawn of entitiesToSpawn) {
      entityToSpawn.addComponent(ComponentKey.Alive, {});
    }
  }
}
