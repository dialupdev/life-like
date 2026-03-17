import { Playback } from "./core/Playback.ts";
import { Renderer } from "./core/Renderer.ts";
import { World } from "./core/World.ts";
import { AppStore } from "./stores/AppStore.ts";
import { DrawerStore } from "./stores/DrawerStore.ts";
import { LayoutStore } from "./stores/LayoutStore.ts";
import { LibraryStore } from "./stores/LibraryStore.ts";

export class Locator {
  public world: World;
  public renderer: Renderer;
  public playback: Playback;

  public drawerStore: DrawerStore;
  public layoutStore: LayoutStore;
  public libraryStore: LibraryStore;
  public appStore: AppStore;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d", { alpha: false })!;

    this.world = new World();
    this.renderer = new Renderer(canvas, context, this.world, "#A76FDE");
    this.playback = new Playback(this.world, this.renderer);

    this.drawerStore = new DrawerStore();
    this.layoutStore = new LayoutStore(canvas, this.renderer);
    this.libraryStore = new LibraryStore(this.world, this.renderer);
    this.appStore = new AppStore(this.world, this.renderer, this.playback);
  }
}
