import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import ConfigStore from "../game/stores/ConfigStore";
import WorldStore from "../game/stores/WorldStore";
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

  private _ticks: number;

  // Stores
  private _configStore: ConfigStore;
  private _worldStore: WorldStore;

  // Systems
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;

  // Controllers
  private _dimensionsController: DimensionsController;

  @state()
  private _playing = false;

  @query("canvas")
  private _canvas: HTMLCanvasElement;

  constructor() {
    super();

    this._configStore = new ConfigStore();
    this._worldStore = new WorldStore();
  }

  private _reset(): void {
    this._ticks = 0;
    this._worldStore.reset();

    // Randomized grid
    for (let x = -20; x <= 20; x++) {
      for (let y = -20; y <= 20; y++) {
        if (Math.random() < 0.5) {
          this._worldStore.spawn(new Cell(x, y));
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

  firstUpdated() {
    this._lifecycleSystem = new LifecycleSystem(this._worldStore, this._configStore);
    this._renderSystem = new RenderSystem(this._worldStore, this._canvas.getContext("2d", { alpha: false }));

    this._dimensionsController = new DimensionsController(this._renderSystem, this._canvas);
    this._dimensionsController.listen();

    this._reset();
  }

  protected render(): TemplateResult {
    return html`<div>
      <x-controls
        .configStore=${this._configStore}
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
