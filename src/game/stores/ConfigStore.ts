import { makeObservable, computed, action } from "mobx";
import { Rule } from "../Rules";
import { parseRule } from "../../utils/RuleUtils";

export default class ConfigStore {
  private _rule: Rule;
  public birthRule: Set<number>;
  public survivalRule: Set<number>;

  constructor() {
    this.setRule(Rule.life);
    makeObservable(this);
  }

  @computed
  public get rule(): Rule {
    return this._rule;
  }

  @action
  public setRule(rule: Rule) {
    this._rule = rule;
    [this.birthRule, this.survivalRule] = parseRule(rule);
  }
}
