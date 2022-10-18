import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import World from "../game/World";

@customElement("x-controls")
class Controls extends MobxLitElement {
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

  private _handleTick(): void {
    this.world.tick();
  }

  private _handlePlay(): void {
    this.world.play();
  }

  private _handlePause(): void {
    this.world.pause();
  }

  private _handleReset(): void {
    this.world.reset();
  }

  private _handleDownloadImage(): void {
    this.world.downloadImage();
  }

  protected render(): TemplateResult {
    return html`
      <div class="buttons">
        <button @click="${this._handleTick}" ?disabled=${this.world.isPlaying}>Tick</button>
        <button @click="${this.world.isPlaying ? this._handlePause : this._handlePlay}">
          ${this.world.isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <div class="buttons">
        <button @click="${this._handleReset}" ?disabled=${this.world.isPlaying}>Reset</button>
        <button @click="${this._handleDownloadImage}" ?disabled=${this.world.isPlaying}>Download image</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-controls": Controls;
  }
}
