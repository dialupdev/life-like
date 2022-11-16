import { Rule } from "../Rules";
import { parseRule } from "../../utils/RuleUtils";

export default class ConfigStore {
  private _rule: Rule;
  public birthRule: Set<number>;
  public survivalRule: Set<number>;

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
