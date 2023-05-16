import { Rule } from "../Rules";
import { ConfigModel } from "../models/ConfigModel";

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
