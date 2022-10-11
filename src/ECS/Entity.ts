import { Component, ComponentKey, ComponentMap } from "./Components";

export default class Entity {
  public _id: string;
  private _components: Map<ComponentKey, Component>;

  constructor(id: string) {
    this._id = id;
    this._components = new Map<ComponentKey, Component>();
  }

  public addComponent<CK extends ComponentKey>(key: CK, component: ComponentMap[CK]): Entity {
    this._components.set(key, component);
    return this;
  }

  public removeComponent(key: ComponentKey): void {
    this._components.delete(key);
  }

  public hasComponent(key: ComponentKey): boolean {
    return this._components.has(key);
  }

  public getComponent<CK extends ComponentKey>(key: CK): ComponentMap[CK] | undefined {
    return this._components.get(key) as ComponentMap[CK];
  }
}
