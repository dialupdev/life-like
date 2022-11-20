import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Rule } from "../game/Rules";
import ConfigController from "../game/controllers/ConfigController";
import PositionController from "../game/controllers/PositionController";
import PlaybackController from "../game/controllers/PlaybackController";

@customElement("x-controls")
class Controls extends MobxLitElement {
  static styles = css`
    :host {
      background: #f4f5f7;
      border-right: 2px solid #ddd;
      box-sizing: border-box;
      display: block;
      padding: 20px;
    }
    .buttons {
      margin: 10px 0;
    }
  `;

  @property()
  public configController: ConfigController;

  @property()
  public positionController: PositionController;

  @property()
  public playbackController: PlaybackController;

  private _changeRule(e: Event): void {
    const rule = (e.target as HTMLSelectElement).value as Rule;
    this.configController.setRule(rule);
  }

  private _recenter(): void {
    this.positionController.recenterOffset();
  }

  private _tick(): void {
    this.playbackController.tick();
  }

  private _play(): void {
    this.playbackController.play();
  }

  private _pause(): void {
    this.playbackController.pause();
  }

  private _reset(): void {
    this.dispatchEvent(new Event("reset"));
  }

  protected render(): TemplateResult {
    const configModel = this.configController.model;
    const playbackModel = this.playbackController.model;

    return html`
      <div class="buttons">
        <label>
          Rule
          <select @change=${this._changeRule}>
            ${Object.entries(Rule).map(([ruleName, rule]) => {
              return html`<option value=${rule} ?selected=${configModel.rule === rule}>${ruleName}</option>`;
            })}
          </select>
        </label>
      </div>
      <div class="buttons">
        <button @click="${this._tick}" ?disabled=${playbackModel.playing}>Tick</button>
        <button @click="${playbackModel.playing ? this._pause : this._play}">
          ${playbackModel.playing ? "Pause" : "Play"}
        </button>
      </div>
      <div class="buttons">
        <button @click="${this._recenter}">Recenter</button>
        <button @click="${this._reset}">Reset</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-controls": Controls;
  }
}
