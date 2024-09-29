import { PIXEL_RATIO, NATURAL_CELL_SIZE } from "./Constants";
import { Config } from "./core/Config";
import { Layout } from "./core/Layout";
import { Library } from "./core/Library";
import { Playback } from "./core/Playback";
import { Renderer } from "./core/Renderer";
import { World } from "./core/World";
import { AppStore } from "./stores/AppStore";
import { ConfigStore } from "./stores/ConfigStore";
import { DrawerStore } from "./stores/DrawerStore";
import { LayoutStore } from "./stores/LayoutStore";
import { LibraryStore } from "./stores/LibraryStore";
import { PlaybackStore } from "./stores/PlaybackStore";

export class Locator {
  public config: Config;
  public world: World;
  public layout: Layout;
  public renderer: Renderer;
  public playback: Playback;
  public library: Library;

  public drawerStore: DrawerStore;
  public configStore: ConfigStore;
  public layoutStore: LayoutStore;
  public playbackStore: PlaybackStore;
  public libraryStore: LibraryStore;
  public appStore: AppStore;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d", { alpha: false })!;

    this.config = new Config();
    this.world = new World();
    this.layout = new Layout(canvas, PIXEL_RATIO, NATURAL_CELL_SIZE);
    this.renderer = new Renderer(this.layout, context, "#A76FDE");
    this.playback = new Playback(this.config, this.world, this.renderer);
    this.library = new Library(this.world);

    this.drawerStore = new DrawerStore();
    this.configStore = new ConfigStore(this.config, this.playback);
    this.layoutStore = new LayoutStore(canvas, this.world, this.layout, this.renderer);
    this.playbackStore = new PlaybackStore(this.playback);
    this.libraryStore = new LibraryStore(this.library, this.configStore, this.layoutStore, this.playbackStore);
    this.appStore = new AppStore(this.world, this.configStore, this.layoutStore, this.playbackStore);
  }
}
