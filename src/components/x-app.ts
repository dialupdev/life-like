import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, queryAsync } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import WorldModel from "../game/models/WorldModel";
import ConfigModel from "../game/models/ConfigModel";
import PositionModel from "../game/models/PositionModel";
import PlaybackModel from "../game/models/PlaybackModel";
import LifecycleSystem from "../game/systems/LifecycleSystem";
import RenderSystem from "../game/systems/RenderSystem";
import ConfigController from "../game/controllers/ConfigController";
import PositionController from "../game/controllers/PositionController";
import PlaybackController from "../game/controllers/PlaybackController";
import PluginBuilder from "../game/plugins/PluginBuilder";
import PluginManager, { PluginGroup } from "../game/plugins/PluginManager";
import "@shoelace-style/shoelace/dist/themes/light.css";
import "./x-sidebar";

@customElement("x-app")
class App extends LitElement {
  static styles = css`
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
  `;

  // Models
  private _worldModel = new WorldModel();
  private _configModel = new ConfigModel();
  private _positionModel = new PositionModel();
  private _playbackModel = new PlaybackModel();

  // Systems
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;

  // Controllers
  private _configController: ConfigController;
  private _positionController: PositionController;
  private _playbackController: PlaybackController;

  // Plugins
  private _pluginBuilder: PluginBuilder;
  private _pluginManager: PluginManager;

  @queryAsync("canvas")
  private _canvasPromise: Promise<HTMLCanvasElement>;

  constructor() {
    super();

    this._lifecycleSystem = new LifecycleSystem(this._worldModel, this._configModel);
    this._renderSystem = new RenderSystem(
      this._worldModel,
      this._positionModel,
      this._playbackModel,
      this._canvasPromise
    );

    this._configController = new ConfigController(this._configModel);
    this._positionController = new PositionController(this._positionModel, this._renderSystem, this._canvasPromise);
    this._playbackController = new PlaybackController(this._playbackModel, this._lifecycleSystem, this._renderSystem);

    this._pluginBuilder = new PluginBuilder(this._canvasPromise);
    this._pluginManager = new PluginManager(this._pluginBuilder, this._positionController, this._playbackController);

    this._pluginManager.activateGroup(PluginGroup.Default);
    this._pluginManager.activateGroup(PluginGroup.Playback);
  }

  private _reset(): void {
    this._playbackController.pause();
    this._worldModel.reset();
    this._worldModel.randomize();
    this._positionController.recenterOffset();
  }

  protected render(): TemplateResult {
    return html`
      <x-sidebar
        .configController=${this._configController}
        .positionController=${this._positionController}
        .playbackController=${this._playbackController}
        @reset=${this._reset}
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
