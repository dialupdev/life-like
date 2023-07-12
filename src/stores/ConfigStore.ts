import { Config, Rule } from "../core/Config";

export class ConfigStore {
  private _config: Config;

  constructor(config: Config) {
    this._config = config;
  }

  public getAllRules(): [string, string][] {
    const ruleNames = Object.keys(Rule);

    return ruleNames.map(ruleName => {
      const ruleValue = Rule[ruleName as keyof typeof Rule];

      return [ruleName, ruleValue];
    });
  }

  public getRule(): Rule {
    return this._config.getRule();
  }

  public setRule(rule: Rule): void {
    this._config.setRule(rule);
  }
}
