import { makeObservable, observable, action } from "mobx";
import { Config, Rule } from "../core/Config";
import { Playback } from "../core/Playback";

export class ConfigStore {
  private _config: Config;
  private _playback: Playback;

  public rule = Rule.life;
  public frameRate = 24;

  constructor(config: Config, playback: Playback) {
    this._config = config;
    this._playback = playback;

    makeObservable(this, {
      rule: observable,
      frameRate: observable,
      setRule: action,
      setFrameRate: action,
    });

    this.setFrameRate(24);
  }

  public getAllRules(): [string, string][] {
    const ruleNames = Object.keys(Rule);

    return ruleNames.map(ruleName => {
      const ruleValue = Rule[ruleName as keyof typeof Rule];

      return [ruleName, ruleValue];
    });
  }

  public setRule(rule: Rule): void {
    this._config.setRule(rule);

    this.rule = rule;
  }

  public setFrameRate(frameRate: number): void {
    this._playback.setFrameRate(frameRate);

    this.frameRate = frameRate;
  }
}
