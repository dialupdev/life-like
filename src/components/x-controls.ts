import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import World from "../game/World";
import { Rule } from "../game/Rules";

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

  private _handleRuleChange(event: Event): void {
    const rule = (event.target as HTMLSelectElement).value as Rule;
    this.world.setRule(rule);
  }

  private _handleShowGridLineChange(event: Event): void {
    const showGridLines = (event.target as HTMLInputElement).checked;
    this.world.setShowGridLines(showGridLines);
  }

  private _handleReset(): void {
    this.world.reset();
  }

  protected render(): TemplateResult {
    return html`
      <div class="buttons">
        <label>
          Rule
          <select @change=${this._handleRuleChange}>
            ${Object.entries(Rule).map(([ruleName, rule]) => {
              return html`<option value=${rule} ?selected=${this.world.rule === rule}>${ruleName}</option>`;
            })}
          </select>
        </label>
        <label>
          <input type="checkbox" ?checked=${this.world.showGridLines} @change=${this._handleShowGridLineChange} />
          Show grid lines
        </label>
        <button @click="${this._handleReset}" ?disabled=${this.world.isPlaying}>Reset</button>
      </div>
      <div class="buttons">
        <button @click="${this._handleTick}" ?disabled=${this.world.isPlaying}>Tick</button>
        <button @click="${this.world.isPlaying ? this._handlePause : this._handlePlay}">
          ${this.world.isPlaying ? "Pause" : "Play"}
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
