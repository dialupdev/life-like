import { makeObservable, observable, action } from "mobx";
import { Config, Rule, RuleKey } from "../core/Config";
import { Playback } from "../core/Playback";

export class ConfigStore {
  private _config: Config;
  private _playback: Playback;

  public frameRate = 30;
  public fieldSize = 50;
  public rule = Rule.life;

  constructor(config: Config, playback: Playback) {
    this._config = config;
    this._playback = playback;

    makeObservable(this, {
      frameRate: observable,
      fieldSize: observable,
      rule: observable,
      setFrameRate: action,
      setFieldSize: action,
      setRule: action,
    });

    const frameRate = localStorage.getItem("frameRate");
    if (frameRate) this.setFrameRate(parseInt(frameRate, 10));

    const fieldSize = localStorage.getItem("fieldSize");
    if (fieldSize) this.setFieldSize(parseInt(fieldSize, 10));

    const rule = localStorage.getItem("rule");
    if (rule) this.setRule(rule as Rule);
  }

  public setFrameRate(frameRate: number): void {
    localStorage.setItem("frameRate", frameRate.toString());

    this._playback.setFrameRate(frameRate);

    this.frameRate = frameRate;
  }

  public setFieldSize(fieldSize: number): void {
    localStorage.setItem("fieldSize", fieldSize.toString());

    this.fieldSize = fieldSize;
  }

  public getAllRules(): [string, string][] {
    const ruleKeys = Object.keys(Rule) as RuleKey[];

    return ruleKeys.map(ruleKey => {
      const ruleName = this._config.ruleNameByKey(ruleKey);
      const ruleValue = Rule[ruleKey];

      return [ruleName, ruleValue];
    });
  }

  public setRule(rule: Rule): void {
    localStorage.setItem("rule", rule);

    this._config.setRule(rule);

    this.rule = rule;
  }
}
