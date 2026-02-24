import { Config } from "./core/Config";
import { Playback } from "./core/Playback";
import { Renderer } from "./core/Renderer";
import { World } from "./core/World";
import { AppStore } from "./stores/AppStore";
import { ConfigStore } from "./stores/ConfigStore";
import { DrawerStore } from "./stores/DrawerStore";
import { LayoutStore } from "./stores/LayoutStore";
import { LibraryStore } from "./stores/LibraryStore";

export class Locator {
  public config: Config;
  public world: World;
  public renderer: Renderer;
  public playback: Playback;

  public drawerStore: DrawerStore;
  public configStore: ConfigStore;
  public layoutStore: LayoutStore;
  public libraryStore: LibraryStore;
  public appStore: AppStore;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d", { alpha: false })!;

    this.config = new Config();
    this.world = new World();
    this.renderer = new Renderer(canvas, context, this.world, "#A76FDE");
    this.playback = new Playback(this.config, this.world, this.renderer);

    this.drawerStore = new DrawerStore();
    this.configStore = new ConfigStore(this.config, this.playback);
    this.layoutStore = new LayoutStore(canvas, this.renderer);
    this.libraryStore = new LibraryStore(this.world, this.renderer, this.configStore);
    this.appStore = new AppStore(this.world, this.renderer, this.playback, this.configStore);
  }
}
