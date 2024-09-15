import { makeObservable, observable, action } from "mobx";

export class DrawerStore {
  public drawerOpen = false;

  constructor() {
    this.openDrawer = this.openDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);

    makeObservable(this, {
      drawerOpen: observable,
      openDrawer: action,
      closeDrawer: action,
      toggleDrawer: action,
    });
  }

  public openDrawer(): void {
    this.drawerOpen = true;
  }

  public closeDrawer(): void {
    this.drawerOpen = false;
  }

  public toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
  }
}
