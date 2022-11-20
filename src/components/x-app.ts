import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, state, queryAsync } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import ConfigModel from "../game/models/ConfigModel";
import WorldModel from "../game/models/WorldModel";
import LifecycleSystem from "../game/systems/LifecycleSystem";
import RenderSystem from "../game/systems/RenderSystem";
import DimensionsController from "../game/controllers/DimensionsController";
import Cell from "../game/Cell";
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

  private _ticks = 0;

  // Models
  private _configModel: ConfigModel;
  private _worldModel: WorldModel;

  // Systems
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;

  // Controllers
  private _dimensionsController: DimensionsController;

  @state()
  private _playing = false;

  @queryAsync("canvas")
  private _canvasPromise: Promise<HTMLCanvasElement>;

  constructor() {
    super();

    this._configModel = new ConfigModel();
    this._worldModel = new WorldModel();

    this._lifecycleSystem = new LifecycleSystem(this._worldModel, this._configModel);
    this._renderSystem = new RenderSystem(this._worldModel, this._canvasPromise);

    this._dimensionsController = new DimensionsController(this._renderSystem, this._canvasPromise);

    this._canvasPromise.then(() => {
      this._dimensionsController.listen();
      this._reset();
    });
  }

  private _reset(): void {
    this._playing = false;
    this._ticks = 0;
    this._worldModel.reset();

    // Randomized grid
    for (let x = -20; x <= 20; x++) {
      for (let y = -20; y <= 20; y++) {
        if (Math.random() < 0.5) {
          this._worldModel.spawn(new Cell(x, y));
        }
      }
    }

    this._dimensionsController.recenterOffset();
  }

  private _tick(): void {
    this._ticks++;
    this._lifecycleSystem.tick();
    this._renderSystem.tick();
  }

  private _tickRecursive = (): void => {
    if (this._playing) {
      this._tick();
      requestAnimationFrame(this._tickRecursive);
    }
  };

  private _play(): void {
    this._playing = true;
    this._tickRecursive();
  }

  private _pause(): void {
    this._playing = false;
  }

  private _recenter(): void {
    this._dimensionsController.recenterOffset();
  }

  protected render(): TemplateResult {
    return html`<div>
      <x-controls
        .configModel=${this._configModel}
        .playing=${this._playing}
        @tick=${this._tick}
        @play=${this._play}
        @pause=${this._pause}
        @reset=${this._reset}
        @recenter=${this._recenter}
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
