import { MobxLitElement } from "@adobe/lit-mobx";
import { World, Layout, Renderer } from "core";
import { TemplateResult, html, css } from "lit";
import { customElement, queryAsync, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { PIXEL_RATIO, NATURAL_CELL_SIZE, SIDEBAR_WIDTH } from "../Constants";
import { ConfigController } from "../game/controllers/ConfigController";
import { LayoutController } from "../game/controllers/LayoutController";
import { PlaybackController } from "../game/controllers/PlaybackController";
import { WorldController } from "../game/controllers/WorldController";
import { ConfigModel } from "../game/models/ConfigModel";
import { PlaybackModel } from "../game/models/PlaybackModel";
import { PluginBuilder } from "../game/plugins/PluginBuilder";
import { PluginManager, PluginGroup } from "../game/plugins/PluginManager";
import "@shoelace-style/shoelace/dist/themes/light.css";
import "./x-sidebar";

@customElement("x-app")
class App extends MobxLitElement {
  public static styles = css`
    :host {
      display: block;
      font-family: var(--sl-font-sans);
      height: 100vh;
    }
    x-sidebar,
    canvas {
      position: absolute;
      top: 0;
    }
    x-sidebar {
      height: 100vh;
      left: 0;
      width: ${SIDEBAR_WIDTH}px;
    }
    canvas {
      image-rendering: pixelated;
      left: ${SIDEBAR_WIDTH}px;
    }
    canvas.tool-pencil {
      cursor: url("/images/pencil.svg"), auto;
    }
    canvas.tool-eraser {
      cursor: url("/images/eraser.svg"), auto;
    }
  `;

  // Core
  private _world!: World;
  private _layout!: Layout;
  private _renderer!: Renderer;

  // Models
  private _configModel = new ConfigModel();
  private _playbackModel = new PlaybackModel();

  // Controllers
  private _worldController!: WorldController;
  private _configController!: ConfigController;
  private _layoutController!: LayoutController;
  private _playbackController!: PlaybackController;

  // Plugins
  private _pluginBuilder!: PluginBuilder;
  private _pluginManager!: PluginManager;

  @state()
  private _loading = true;

  @queryAsync("canvas")
  private _canvasPromise!: Promise<HTMLCanvasElement>;

  constructor() {
    super();

    this._canvasPromise.then(canvas => {
      const context = canvas.getContext("2d", { alpha: false })!;

      this._world = World.new();
      this._layout = Layout.new(canvas, PIXEL_RATIO, NATURAL_CELL_SIZE);
      this._renderer = Renderer.new(context, "lightblue");

      this._worldController = new WorldController(this._world);
      this._configController = new ConfigController(this._configModel);
      this._layoutController = new LayoutController(canvas, this._layout, this._world, this._renderer);
      this._playbackController = new PlaybackController(this._layout, this._world, this._playbackModel, this._renderer);

      this._pluginBuilder = new PluginBuilder(canvas);
      this._pluginManager = new PluginManager(this._pluginBuilder, this._layoutController, this._playbackController);

      this._pluginManager.activateGroup(PluginGroup.Default);
      this._pluginManager.activateGroup(PluginGroup.Playback);

      this._loading = false;
    });
  }

  protected render(): TemplateResult {
    return html`
      ${when(
        !this._loading,
        () => html`<x-sidebar
          .worldController=${this._worldController}
          .configController=${this._configController}
          .layoutController=${this._layoutController}
          .playbackController=${this._playbackController}
        ></x-sidebar>`
      )}
      <canvas></canvas>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
