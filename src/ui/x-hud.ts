import { MobxLitElement } from "@adobe/lit-mobx";
import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import throttle from "lodash.throttle";
import { reaction, type IReactionDisposer } from "mobx";

import type { Locator } from "../Locator.ts";
import type { TemplateResult } from "lit";

@customElement("x-hud")
class Hud extends MobxLitElement {
  public static styles = css`
    * {
      box-sizing: border-box;
    }
    :host {
      backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.5);
      border-top-left-radius: 8px;
      bottom: 0;
      font-family: monospace;
      font-size: 10px;
      display: block;
      padding: 8px 10px;
      position: absolute;
      right: 0;
    }
  `;

  @property()
  public accessor locator!: Locator;

  @state()
  private accessor _generation = 0;

  @state()
  private accessor _population = 0;

  private worldStateDisposer?: IReactionDisposer;

  private _flushWorldState = (): void => {
    this._generation = this.locator.world.generation;
    this._population = this.locator.world.population;
  };

  connectedCallback(): void {
    super.connectedCallback();

    const throttledFlushWorldState = throttle(this._flushWorldState, 250);

    this.worldStateDisposer = reaction(
      () => [this.locator.world.generation, this.locator.world.population],
      throttledFlushWorldState,
      { fireImmediately: true }
    );
  }

  disconnectedCallback(): void {
    this.worldStateDisposer?.();

    super.disconnectedCallback();
  }

  protected render(): TemplateResult {
    return html`
      <div class="frame-rate">
        <span>Generation: ${this._generation}</span> |
        <span>Population: ${this._population}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-hud": Hud;
  }
}
