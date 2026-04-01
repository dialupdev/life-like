import { describe, expect, it } from "vitest";

import { parseRule } from "../utils/RuleUtils.ts";
import { Rule } from "../core/Rules.ts";

import type { LifeAlgorithm } from "./LifeAlgorithm.ts";
import { GollyQuickLife } from "./GollyQuickLife.ts";
import { QuickLife } from "./QuickLife.ts";
import { SzudzikSparseLife } from "./SzudzikSparseLife.ts";

const CHUNK_ENGINES: { name: string; create: () => LifeAlgorithm }[] = [
  { name: "QuickLife", create: () => new QuickLife() },
  { name: "GollyQuickLife", create: () => new GollyQuickLife() },
];

function collectLiveSet(algo: LifeAlgorithm): Set<string> {
  const s = new Set<string>();
  if (algo.getPopulation() === 0) {
    return s;
  }
  const [bx, by, w, h] = algo.getBounds();
  if (w <= 0 || h <= 0) {
    return s;
  }
  const maxX = bx + w - 1;
  const maxY = by + h - 1;
  algo.forEachCellInRect(bx, by, maxX, maxY, (c) => {
    s.add(`${c.x},${c.y}`);
  });
  return s;
}

function assertSamePopulationAndCells(a: LifeAlgorithm, b: LifeAlgorithm): void {
  expect(a.getPopulation()).toBe(b.getPopulation());
  expect(collectLiveSet(a)).toEqual(collectLiveSet(b));
}

function seedChunkEngine(
  create: () => LifeAlgorithm,
  points: { x: number; y: number }[],
  rule: Rule
): [LifeAlgorithm, SzudzikSparseLife] {
  const q = create();
  const z = new SzudzikSparseLife();
  const [birth, survival] = parseRule(rule);
  q.setRule(birth, survival);
  z.setRule(birth, survival);
  for (const p of points) {
    q.addCell(p.x, p.y);
    z.addCell(p.x, p.y);
  }
  return [q, z];
}

describe.each(CHUNK_ENGINES)("$name vs SzudzikSparseLife parity", ({ create }) => {
  it("blinker one step (Life)", () => {
    const horizontal = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    const [q, z] = seedChunkEngine(create, horizontal, Rule.life);
    q.tick();
    z.tick();
    assertSamePopulationAndCells(q, z);
    expect(collectLiveSet(q)).toEqual(new Set(["1,-1", "1,0", "1,1"]));
  });

  it("glider four steps (Life)", () => {
    const start = [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ];
    const [q, z] = seedChunkEngine(create, start, Rule.life);
    for (let i = 0; i < 4; i++) {
      q.tick();
      z.tick();
      assertSamePopulationAndCells(q, z);
    }
  });

  it("HighLife small pattern", () => {
    const [q, z] = seedChunkEngine(
      create,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      Rule.highLife
    );
    for (let i = 0; i < 6; i++) {
      q.tick();
      z.tick();
      assertSamePopulationAndCells(q, z);
    }
  });

  it("saveSnapshot and restoreSnapshot match Szudzik", () => {
    const [q, z] = seedChunkEngine(
      create,
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      Rule.life
    );
    q.tick();
    z.tick();
    q.saveSnapshot();
    z.saveSnapshot();
    q.addCell(10, 10);
    z.addCell(10, 10);
    q.restoreSnapshot();
    z.restoreSnapshot();
    assertSamePopulationAndCells(q, z);
  });
});
