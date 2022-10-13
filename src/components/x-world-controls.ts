import { LitElement, TemplateResult, html, css } from "lit";
import { customElement } from "lit/decorators.js";

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

@customElement("x-world-controls")
class WorldControls extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .buttons {
      margin: 10px 0;
    }
  `;

  private _handleTick(): void {
    this.dispatchEvent(new TickEvent());
  }

  private _handlePlay(): void {
    this.dispatchEvent(new PlayEvent());
  }

  private _handlePause(): void {
    this.dispatchEvent(new PauseEvent());
  }

  protected render(): TemplateResult {
    return html`
      <div class="buttons">
        <button @click="${this._handleTick}">Tick</button>
        <button @click="${this._handlePlay}">Play</button>
        <button @click="${this._handlePause}">Pause</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-world-controls": WorldControls;
  }
}
