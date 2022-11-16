import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import ConfigStore from "../game/stores/ConfigStore";
import WorldStore from "../game/stores/WorldStore";
import DimensionsStore from "../game/stores/DimensionsStore";
import LifecycleSystem from "../game/systems/LifecycleSystem";
import RenderSystem from "../game/systems/RenderSystem";
import Cell from "../game/Cell";
import "./x-controls";

@customElement("x-app")
class App extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100vh;
    }
    canvas {
      border: 1px solid #eee;
      image-rendering: pixelated;
    }
  `;

  private _ticks: number;

  // Stores
  private _configStore: ConfigStore;
  private _worldStore: WorldStore;
  private _dimensionsStore: DimensionsStore;

  // Systems
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;

  @state()
  private _playing = false;

  @query("canvas")
  private _canvas: HTMLCanvasElement;

  constructor() {
    super();

    this._configStore = new ConfigStore();
    this._worldStore = new WorldStore();
    this._dimensionsStore = new DimensionsStore();
  }

  private _reset(): void {
    this._ticks = 0;
    this._worldStore.reset();

    // Randomized grid
    for (let x = 0; x < this._dimensionsStore.gridWidth; x++) {
      for (let y = 0; y < this._dimensionsStore.gridHeight; y++) {
        if (Math.random() < 0.5) {
          this._worldStore.spawn(new Cell(x, y));
        }
      }
    }

    this._renderSystem.tick();
  }

  private _tick(): void {
    this._ticks++;
    this._lifecycleSystem.tick();
    this._renderSystem.tick();
  }

  private _tickRecursive = () => {
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

  public firstUpdated() {
    this._canvas.style.width = `${this._dimensionsStore.gridDisplayWidth / devicePixelRatio}px`;
    this._canvas.style.height = `${this._dimensionsStore.gridDisplayHeight / devicePixelRatio}px`;

    this._lifecycleSystem = new LifecycleSystem(this._worldStore, this._configStore);
    this._renderSystem = new RenderSystem(this._worldStore, this._dimensionsStore, this._canvas.getContext("2d"));

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
      ></x-controls>
      <canvas
        width=${this._dimensionsStore.gridDisplayWidth}
        height=${this._dimensionsStore.gridDisplayHeight}
      ></canvas>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
