import World from "../World";
import Cell from "../Cell";
import type { System } from "./System";
import { Rule } from "../Rules";
import { parseRule } from "../../utils/RuleUtils";

export default class LifecycleSystem implements System {
  private _world: World;
  private _birthSet: Set<number>;
  private _survivalSet: Set<number>;

  constructor(world: World, rule: Rule = Rule.life) {
    this._world = world;
    [this._birthSet, this._survivalSet] = parseRule(rule);
  }

  public tick(): void {
    const cellsToKill = new Set<Cell>();
    const cellsToSpawn = new Set<Cell>();

    // Mark cells to kill
    for (const [cellHash, cell] of this._world.cells) {
      const neighborCount = this._world.neighborCounts.get(cellHash);

      if (!neighborCount || !this._survivalSet.has(neighborCount)) {
        cellsToKill.add(cell);
      }
    }

    // Mark cells to spawn
    for (const [cellHash, count] of this._world.neighborCounts) {
      if (this._birthSet.has(count) && !this._world.cells.has(cellHash)) {
        const cell = Cell.fromHash(cellHash);
        cellsToSpawn.add(cell);
      }
    }

    // Kill cells
    for (const cell of cellsToKill) {
      this._world.kill(cell);
    }

    // Spawn cells
    for (const cell of cellsToSpawn) {
      this._world.spawn(cell);
    }
  }
}
