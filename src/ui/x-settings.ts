import { MobxLitElement } from "@adobe/lit-mobx";
import { Picker } from "@spectrum-web-components/picker";
import { Slider } from "@spectrum-web-components/slider";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import { Rule } from "../core/Rules";
import { Locator } from "../Locator";
import { getAllRules } from "../utils/RuleUtils";

import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/action-group/sp-action-group.js";
import "@spectrum-web-components/field-label/sp-field-label.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/picker/sp-picker.js";
import "@spectrum-web-components/slider/sp-slider.js";

@customElement("x-settings")
class Settings extends MobxLitElement {
  public static styles = css`
    :host {
      display: block;
    }
  `;

  @property()
  public accessor locator!: Locator;

  private _setRandomizeFieldSize(e: Event): void {
    const fieldSize = (e.target as Slider).value;
    this.locator.world.setRandomizeFieldSize(fieldSize);
  }

  private _setRandomizeAverageDensity(e: Event): void {
    const averageDensity = (e.target as Slider).value;
    this.locator.world.setRandomizeAverageDensity(averageDensity);
  }

  private _setRule(e: Event): void {
    const rule = (e.target as Picker).value as Rule;
    this.locator.world.setRule(rule);
  }

  protected render(): TemplateResult {
    return html`
      <sp-field-label for="randomize-field-size">Field size (when randomized)</sp-field-label>
      <sp-slider
        id="randomize-field-size"
        editable
        min="4"
        max="400"
        step="1"
        variant="filled"
        value=${this.locator.world.randomizeFieldSize}
        @input="${this._setRandomizeFieldSize}"
      >
      </sp-slider>

      <sp-field-label for="randomize-average-density">Average density (when randomized)</sp-field-label>
      <sp-slider
        id="randomize-average-density"
        editable
        min="0.01"
        max="1"
        step="0.01"
        variant="filled"
        value=${this.locator.world.randomizeAverageDensity}
        @input="${this._setRandomizeAverageDensity}"
      >
      </sp-slider>

      <sp-field-label for="rule">Rule</sp-field-label>
      <sp-picker id="rule" value=${this.locator.world.rule} @change=${this._setRule}>
        ${getAllRules().map(([name, value]) => {
          return html`<sp-menu-item value=${value}>${name}</sp-menu-item>`;
        })}
      </sp-picker>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-settings": Settings;
  }
}
