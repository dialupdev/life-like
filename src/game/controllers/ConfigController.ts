import { ConfigModel } from "../models/ConfigModel";
import { Rule } from "../Rules";

export class ConfigController {
  private _configModel: ConfigModel;

  constructor(configModel: ConfigModel) {
    this._configModel = configModel;
  }

  public setRule(rule: Rule): void {
    this._configModel.rule = rule;
  }

  public get model(): Readonly<ConfigModel> {
    return this._configModel;
  }
}
