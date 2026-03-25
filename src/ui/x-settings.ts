import { MobxLitElement } from "@adobe/lit-mobx";
import { consume } from "@lit/context";
import { html, css } from "lit";
import { customElement } from "lit/decorators.js";

import { type World, worldContext } from "../core/World.ts";

import type { Slider } from "@spectrum-web-components/slider";
import type { TemplateResult } from "lit";

import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/action-group/sp-action-group.js";
import "@spectrum-web-components/field-label/sp-field-label.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/slider/sp-slider.js";

@customElement("x-settings")
class Settings extends MobxLitElement {
  public static styles = css`
    :host {
      display: block;
    }
  `;

  @consume({ context: worldContext })
  private accessor _world!: World;

  private _setRandomizeFieldSize(e: Event): void {
    const fieldSize = (e.target as Slider).value;
    this._world.setRandomizeFieldSize(fieldSize);
  }

  private _setRandomizeAverageDensity(e: Event): void {
    const averageDensity = (e.target as Slider).value;
    this._world.setRandomizeAverageDensity(averageDensity);
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
        value=${this._world.randomizeFieldSize}
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
        value=${this._world.randomizeAverageDensity}
        @input="${this._setRandomizeAverageDensity}"
      >
      </sp-slider>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-settings": Settings;
  }
}
