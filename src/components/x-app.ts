import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, queryAsync } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import { ConfigController } from "../game/controllers/ConfigController";
import { LayoutController } from "../game/controllers/LayoutController";
import { PlaybackController } from "../game/controllers/PlaybackController";
import { WorldController } from "../game/controllers/WorldController";
import { ConfigModel } from "../game/models/ConfigModel";
import { LayoutModel } from "../game/models/LayoutModel";
import { PlaybackModel } from "../game/models/PlaybackModel";
import { WorldModel } from "../game/models/WorldModel";
import { PluginBuilder } from "../game/plugins/PluginBuilder";
import { PluginManager, PluginGroup } from "../game/plugins/PluginManager";
import { LifecycleSystem } from "../game/systems/LifecycleSystem";
import { RenderSystem } from "../game/systems/RenderSystem";
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

  // Models
  private _worldModel = new WorldModel();
  private _configModel = new ConfigModel();
  private _layoutModel = new LayoutModel();
  private _playbackModel = new PlaybackModel();

  // Systems
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;

  // Controllers
  private _worldController: WorldController;
  private _configController: ConfigController;
  private _layoutController: LayoutController;
  private _playbackController: PlaybackController;

  // Plugins
  private _pluginBuilder: PluginBuilder;
  private _pluginManager: PluginManager;

  @queryAsync("canvas")
  private _canvasPromise!: Promise<HTMLCanvasElement>;

  constructor() {
    super();

    this._lifecycleSystem = new LifecycleSystem(this._worldModel, this._configModel);
    this._renderSystem = new RenderSystem(
      this._worldModel,
      this._layoutModel,
      this._playbackModel,
      this._canvasPromise
    );

    this._worldController = new WorldController(this._worldModel);
    this._configController = new ConfigController(this._configModel);
    this._layoutController = new LayoutController(this._layoutModel, this._renderSystem, this._canvasPromise);
    this._playbackController = new PlaybackController(this._playbackModel, this._lifecycleSystem, this._renderSystem);

    this._pluginBuilder = new PluginBuilder(this._canvasPromise);
    this._pluginManager = new PluginManager(this._pluginBuilder, this._layoutController, this._playbackController);

    this._pluginManager.activateGroup(PluginGroup.Default);
    this._pluginManager.activateGroup(PluginGroup.Playback);
  }

  protected render(): TemplateResult {
    return html`
      <x-sidebar
        .worldController=${this._worldController}
        .configController=${this._configController}
        .LayoutController=${this._layoutController}
        .playbackController=${this._playbackController}
      ></x-sidebar>
      <canvas></canvas>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
