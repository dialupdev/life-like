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
import "./x-sidebar";

@customElement("x-app")
class App extends LitElement {
  static styles = css`
    :host {
      display: block;
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
  private _worldModel: WorldModel;
  private _configModel: ConfigModel;
  private _positionModel: PositionModel;
  private _playbackModel: PlaybackModel;

  // Systems
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;

  // Controllers
  private _configController: ConfigController;
  private _positionController: PositionController;
  private _playbackController: PlaybackController;

  @queryAsync("canvas")
  private _canvasPromise: Promise<HTMLCanvasElement>;

  constructor() {
    super();

    this._worldModel = new WorldModel();
    this._configModel = new ConfigModel();
    this._positionModel = new PositionModel();
    this._playbackModel = new PlaybackModel();

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
  }

  private _reset(): void {
    this._playbackController.pause();
    this._worldModel.reset();
    this._worldModel.randomize();
    this._positionController.recenterOffset();
  }

  protected render(): TemplateResult {
    return html`<div>
      <x-sidebar
        .configController=${this._configController}
        .positionController=${this._positionController}
        .playbackController=${this._playbackController}
        @reset=${this._reset}
      ></x-sidebar>
      <canvas></canvas>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
