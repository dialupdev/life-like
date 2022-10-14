import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import World from "../game/World";

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

  @property()
  public world: World;

  @state()
  private _isPlaying = false;

  private _handleTick(): void {
    this.world.tick();
  }

  private _handlePlay(): void {
    this._isPlaying = true;
    this.world.play();
  }

  private _handlePause(): void {
    this._isPlaying = false;
    this.world.pause();
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
