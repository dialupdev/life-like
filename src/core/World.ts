import { createContext } from "@lit/context";
import { makeObservable, observable, action } from "mobx";

import { SzudzikSparseLife } from "../algorithms/SzudzikSparseLife.ts";
import { parseRule, getRuleKeyByValue } from "../utils/RuleUtils.ts";
import { getUserConfig, setUserConfig } from "../utils/UserConfigUtils.ts";
import { Rule } from "./Rules.ts";

import type { LifeAlgorithm } from "../algorithms/LifeAlgorithm.ts";
import type { RuleKey } from "../utils/RuleUtils.ts";
import type { Cell } from "./Cell.ts";

export const worldContext = createContext<World>("world");

export class World {
  private _algorithm: LifeAlgorithm;

  @observable public accessor generation = 0;
  @observable public accessor population = 0;

  @observable public accessor rule = Rule.life;
  @observable public accessor randomizeFieldSize = 100;
  @observable public accessor randomizeAverageDensity = 0.5;

  constructor() {
    this._algorithm = new SzudzikSparseLife();

    const [birthSet, survivalSet] = parseRule(this.rule);
    this._algorithm.setRule(birthSet, survivalSet);

    this.setRule = this.setRule.bind(this);
    this.setRandomizeFieldSize = this.setRandomizeFieldSize.bind(this);
    this.setRandomizeAverageDensity = this.setRandomizeAverageDensity.bind(this);

    getUserConfig("rule", (value: string) => Rule[value as RuleKey], this.setRule);
    getUserConfig("randomizeFieldSize", (value: string) => parseInt(value, 10), this.setRandomizeFieldSize);
    getUserConfig("randomizeAverageDensity", (value: string) => parseFloat(value), this.setRandomizeAverageDensity);

    makeObservable(this);
  }

  @action
  public setRule(rule: Rule): void {
    const [birthSet, survivalSet] = parseRule(rule);
    this._algorithm.setRule(birthSet, survivalSet);

    this.rule = rule;

    setUserConfig("rule", getRuleKeyByValue(rule));
  }

  @action
  public setRandomizeFieldSize(randomizeFieldSize: number): void {
    this.randomizeFieldSize = randomizeFieldSize;

    setUserConfig("randomizeFieldSize", randomizeFieldSize.toString());
  }

  @action
  public setRandomizeAverageDensity(randomizeAverageDensity: number): void {
    this.randomizeAverageDensity = randomizeAverageDensity;

    setUserConfig("randomizeAverageDensity", randomizeAverageDensity.toString());
  }

  public addCell(worldX: number, worldY: number): void {
    this._algorithm.addCell(worldX, worldY);
  }

  public removeCell(worldX: number, worldY: number): void {
    this._algorithm.removeCell(worldX, worldY);
  }

  @action
  public tick(): void {
    this._algorithm.tick();

    this.generation++;
    this.population = this._algorithm.getPopulation();
  }

  public forEachCellInRect(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    callback: (cell: Cell) => void
  ): void {
    this._algorithm.forEachCellInRect(minX, minY, maxX, maxY, callback);
  }

  public clear(): void {
    this._algorithm.clear();
  }

  @action
  public saveSnapshot(): void {
    this._algorithm.saveSnapshot();

    this.generation = 0;
    this.population = this._algorithm.getPopulation();
  }

  @action
  public restoreSnapshot(): void {
    this._algorithm.restoreSnapshot();

    this.generation = 0;
    this.population = this._algorithm.getPopulation();
  }

  public randomize(): void {
    this.clear();

    const min = Math.floor(this.randomizeFieldSize / 2) * -1;
    const max = min + this.randomizeFieldSize;

    for (let worldX = min; worldX < max; worldX++) {
      for (let worldY = min; worldY < max; worldY++) {
        if (Math.random() < this.randomizeAverageDensity) {
          this.addCell(worldX, worldY);
        }
      }
    }

    this.saveSnapshot();
  }

  public getBounds(): [number, number, number, number] {
    return this._algorithm.getBounds();
  }
}
