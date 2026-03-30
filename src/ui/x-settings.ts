import { MobxLitElement } from "@adobe/lit-mobx";
import { consume } from "@lit/context";
import { html, css } from "lit";
import { customElement } from "lit/decorators.js";

import { type Renderer, rendererContext } from "../core/Renderer.ts";
import { type World, worldContext } from "../core/World.ts";

import type { Slider } from "@spectrum-web-components/slider";
import type { Switch } from "@spectrum-web-components/switch";
import type { TemplateResult } from "lit";

import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/action-group/sp-action-group.js";
import "@spectrum-web-components/field-label/sp-field-label.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/slider/sp-slider.js";
import "@spectrum-web-components/switch/sp-switch.js";

@customElement("x-settings")
class Settings extends MobxLitElement {
  public static styles = css`
    :host {
      display: block;
    }
  `;

  @consume({ context: worldContext })
  private accessor _world!: World;

  @consume({ context: rendererContext })
  private accessor _renderer!: Renderer;

  private _setRandomizeFieldSize(e: Event): void {
    const fieldSize = (e.target as Slider).value;
    this._world.setRandomizeFieldSize(fieldSize);
  }

  private _setRandomizeAverageDensity(e: Event): void {
    const averageDensity = (e.target as Slider).value;
    this._world.setRandomizeAverageDensity(averageDensity);
  }

  private _setDebugMode(e: Event): void {
    this._renderer.setDebugMode((e.target as Switch).checked);
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

      <overlay-trigger triggered-by="hover">
        <sp-switch slot="trigger" ?checked=${this._renderer.debugMode} @change="${this._setDebugMode}"
          >Debug mode</sp-switch
        >
        <sp-tooltip slot="hover-content" placement="bottom" delayed>Toggle debug mode (D)</sp-tooltip>
      </overlay-trigger>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-settings": Settings;
  }
}
