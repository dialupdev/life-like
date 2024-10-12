import { MobxLitElement } from "@adobe/lit-mobx";
import { Picker } from "@spectrum-web-components/picker";
import { Slider } from "@spectrum-web-components/slider";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Rule } from "../core/Config";
import { Locator } from "../Locator";
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

  private _setFieldSize(e: Event): void {
    const fieldSize = (e.target as Slider).value;
    this.locator.configStore.setFieldSize(fieldSize);
  }

  private _setAverageDensity(e: Event): void {
    const averageDensity = (e.target as Slider).value;
    this.locator.configStore.setAverageDensity(averageDensity);
  }

  private _setRule(e: Event): void {
    const rule = (e.target as Picker).value as Rule;
    this.locator.configStore.setRule(rule);
  }

  protected render(): TemplateResult {
    return html`
      <sp-field-label for="field-size">Field size (when randomized)</sp-field-label>
      <sp-slider
        id="field-size"
        editable
        min="4"
        max="400"
        step="1"
        variant="filled"
        value=${this.locator.configStore.fieldSize}
        @input="${this._setFieldSize}"
      >
      </sp-slider>

      <sp-field-label for="average-density">Average density (when randomized)</sp-field-label>
      <sp-slider
        id="average-density"
        editable
        min="0.1"
        max="1"
        step="0.1"
        variant="filled"
        value=${this.locator.configStore.averageDensity}
        @input="${this._setAverageDensity}"
      >
      </sp-slider>

      <sp-field-label for="rule">Rule</sp-field-label>
      <sp-picker id="rule" value=${this.locator.configStore.rule} @change=${this._setRule}>
        ${this.locator.configStore.getAllRules().map(([name, value]) => {
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
