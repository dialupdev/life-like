import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, queryAsync } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import WorldModel from "../game/models/WorldModel";
import ConfigModel from "../game/models/ConfigModel";
import PlaybackModel from "../game/models/PlaybackModel";
import LifecycleSystem from "../game/systems/LifecycleSystem";
import RenderSystem from "../game/systems/RenderSystem";
import ConfigController from "../game/controllers/ConfigController";
import DimensionsController from "../game/controllers/DimensionsController";
import PlaybackController from "../game/controllers/PlaybackController";
import "./x-controls";

@customElement("x-app")
class App extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100vh;
    }
    x-controls,
    canvas {
      position: absolute;
      top: 0;
    }
    x-controls {
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
  private _playbackModel: PlaybackModel;

  // Systems
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;

  // Controllers
  private _configController: ConfigController;
  private _dimensionsController: DimensionsController;
  private _playbackController: PlaybackController;

  @queryAsync("canvas")
  private _canvasPromise: Promise<HTMLCanvasElement>;

  constructor() {
    super();

    this._worldModel = new WorldModel();
    this._configModel = new ConfigModel();
    this._playbackModel = new PlaybackModel();

    this._lifecycleSystem = new LifecycleSystem(this._worldModel, this._configModel);
    this._renderSystem = new RenderSystem(this._worldModel, this._canvasPromise);

    this._configController = new ConfigController(this._configModel);
    this._dimensionsController = new DimensionsController(this._renderSystem, this._canvasPromise);
    this._playbackController = new PlaybackController(this._playbackModel, this._lifecycleSystem, this._renderSystem);

    this._canvasPromise.then(() => {
      this._reset();
    });
  }

  private _reset(): void {
    this._playbackController.pause();
    this._worldModel.reset();
    this._worldModel.randomize();
    this._dimensionsController.recenterOffset();
  }

  protected render(): TemplateResult {
    return html`<div>
      <x-controls
        .configController=${this._configController}
        .dimensionsController=${this._dimensionsController}
        .playbackController=${this._playbackController}
        @reset=${this._reset}
      ></x-controls>
      <canvas></canvas>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
