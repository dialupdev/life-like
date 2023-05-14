import { Rule, parseRule } from "../Rules";

export default class ConfigModel {
  private _rule!: Rule;
  public birthRule!: Set<number>;
  public survivalRule!: Set<number>;

  constructor() {
    this.rule = Rule.life;
  }

  public get rule(): Rule {
    return this._rule;
  }

  public set rule(rule: Rule) {
    this._rule = rule;
    [this.birthRule, this.survivalRule] = parseRule(rule);
  }
}
