import Entity from "../Entity";
import { ComponentKey } from "../Components";

export function isNeighbor(entity: Entity, potentialNeighbor: Entity): boolean {
  const { x: x1, y: y1 } = entity.getComponent(ComponentKey.Position);
  const { x: x2, y: y2 } = potentialNeighbor.getComponent(ComponentKey.Position);

  // Self
  if (x2 === x1 && y2 === y1) {
    return false;
  }

  // Within one cell, but not self
  if ((Math.abs(x2 - x1) === 0 || Math.abs(x2 - x1) === 1) && (Math.abs(y2 - y1) === 0 || Math.abs(y2 - y1) === 1)) {
    return true;
  }

  return false;
}
