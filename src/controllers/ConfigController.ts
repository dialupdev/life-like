import { Config, Rule } from "core";

export class ConfigController {
  private _config: Config;

  constructor(config: Config) {
    this._config = config;
  }

  public getAllRules(): [string, number][] {
    const ruleNames = Object.values(Rule).filter(value => isNaN(value as Rule)) as string[];

    return ruleNames.map(ruleName => {
      const ruleValue = Rule[ruleName as keyof typeof Rule];

      return [ruleName, ruleValue];
    });
  }

  public getRule(): Rule {
    return this._config.get_rule();
  }

  public setRule(rule: Rule): void {
    this._config.set_rule(rule);
  }

  public get model(): Readonly<Config> {
    return this._config;
  }
}

export { Rule } from "core";
