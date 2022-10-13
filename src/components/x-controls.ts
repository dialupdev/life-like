import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import World from "../game/World";

export class TickEvent extends Event {
  constructor() {
    super("tick");
  }
}

export class PlayEvent extends Event {
  constructor() {
    super("play");
  }
}

export class PauseEvent extends Event {
  constructor() {
    super("pause");
  }
}

@customElement("x-controls")
class Controls extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .buttons {
      margin: 10px 0;
    }
  `;

  @property({ type: World })
  public world;

  @state()
  private _isPlaying = false;

  private _handleTick(): void {
    this.dispatchEvent(new TickEvent());
  }

  private _handlePlay(): void {
    this._isPlaying = true;
    this.dispatchEvent(new PlayEvent());
  }

  private _handlePause(): void {
    this._isPlaying = false;
    this.dispatchEvent(new PauseEvent());
  }

  protected render(): TemplateResult {
    return html`
      <div class="buttons">
        <button @click="${this._handleTick}">Tick</button>
        <button @click="${this._isPlaying ? this._handlePause : this._handlePlay}">
          ${this._isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-controls": Controls;
  }
}
