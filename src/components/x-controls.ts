import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import ConfigModel from "../game/models/ConfigModel";
import { Rule } from "../game/Rules";

@customElement("x-controls")
class Controls extends LitElement {
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
  public configModel: ConfigModel;

  @property()
  public playing = false;

  private _tick(): void {
    this.dispatchEvent(new Event("tick"));
  }

  private _play(): void {
    this.dispatchEvent(new Event("play"));
  }

  private _pause(): void {
    this.dispatchEvent(new Event("pause"));
  }

  private _recenter(): void {
    this.dispatchEvent(new Event("recenter"));
  }

  private _reset(): void {
    this.dispatchEvent(new Event("reset"));
  }

  private _changeRule(event: Event): void {
    const rule = (event.target as HTMLSelectElement).value as Rule;
    this.configModel.rule = rule;
  }

  protected render(): TemplateResult {
    return html`
      <div class="buttons">
        <label>
          Rule
          <select @change=${this._changeRule}>
            ${Object.entries(Rule).map(([ruleName, rule]) => {
              return html`<option value=${rule} ?selected=${this.configModel.rule === rule}>${ruleName}</option>`;
            })}
          </select>
        </label>
        <button @click="${this._reset}">Reset</button>
      </div>
      <div class="buttons">
        <button @click="${this._tick}" ?disabled=${this.playing}>Tick</button>
        <button @click="${this.playing ? this._pause : this._play}">${this.playing ? "Pause" : "Play"}</button>
      </div>
      <div class="buttons">
        <button @click="${this._recenter}">Recenter</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-controls": Controls;
  }
}
