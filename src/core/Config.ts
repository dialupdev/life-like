import { Rule } from "./Rules";
import { parseRule } from "../utils/RuleUtils";

export class Config {
  private _rule: Rule;

  public birthSet: Set<number>;
  public survivalSet: Set<number>;

  constructor() {
    const rule = Rule.life;
    const [birthSet, survivalSet] = parseRule(rule);

    this._rule = rule;
    this.birthSet = birthSet;
    this.survivalSet = survivalSet;
  }

  public getRule(): Rule {
    return this._rule;
  }

  public setRule(rule: Rule): void {
    [this.birthSet, this.survivalSet] = parseRule(rule);

    this._rule = rule;
  }
}
