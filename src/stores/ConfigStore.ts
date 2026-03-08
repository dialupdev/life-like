import { makeObservable, observable, action } from "mobx";

export class ConfigStore {
  @observable public accessor fieldSize = 50;
  @observable public accessor averageDensity = 0.5;

  constructor() {
    makeObservable(this);

    const fieldSize = localStorage.getItem("fieldSize");
    if (fieldSize) this.setFieldSize(parseInt(fieldSize, 10));

    const averageDensity = localStorage.getItem("averageDensity");
    if (averageDensity) this.setAverageDensity(parseFloat(averageDensity));
  }

  @action
  public setFieldSize(fieldSize: number): void {
    localStorage.setItem("fieldSize", fieldSize.toString());

    this.fieldSize = fieldSize;
  }

  @action
  public setAverageDensity(averageDensity: number): void {
    localStorage.setItem("averageDensity", averageDensity.toString());

    this.averageDensity = averageDensity;
  }
}
