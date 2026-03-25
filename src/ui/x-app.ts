import { MobxLitElement } from "@adobe/lit-mobx";
import { html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";

import { SIDEBAR_WIDTH } from "../Constants.ts";
import { Locator } from "../Locator.ts";
import { PluginBuilder } from "../plugins/PluginBuilder.ts";
import { PluginManager, PluginGroup } from "../plugins/PluginManager.ts";

import type { TemplateResult } from "lit";

import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/spectrum-two/scale-medium.js";
import "@spectrum-web-components/theme/spectrum-two/theme-light.js";
import "./x-hud.ts";
import "./x-sidebar.ts";

@customElement("x-app")
class App extends MobxLitElement {
  public static styles = css`
    * {
      box-sizing: border-box;
    }
    :host {
      display: block;
    }
    ::slotted(canvas) {
      image-rendering: pixelated;
      left: ${SIDEBAR_WIDTH}px;
      position: absolute;
      top: 0;
    }
  `;

  @state()
  private accessor _locator!: Locator;

  connectedCallback(): void {
    super.connectedCallback();

    const canvas = this.querySelector("canvas")!;

    this._locator = new Locator(canvas);

    const pluginBuilder = new PluginBuilder(canvas);
    const pluginManager = new PluginManager(
      pluginBuilder,
      this._locator.renderer,
      this._locator.playback,
      this._locator.drawerStore,
      this._locator.layoutStore,
      this._locator.appStore
    );

    pluginManager.activateGroup(PluginGroup.default);
    pluginManager.activateGroup(PluginGroup.playback);
  }

  protected render(): TemplateResult {
    return html`
      <sp-theme system="spectrum-two" scale="medium" color="light">
        <slot></slot>

        ${when(
          this._locator,
          () => html`
            <x-sidebar .locator=${this._locator}></x-sidebar>
            <x-hud .locator=${this._locator}></x-hud>
          `
        )}
      </sp-theme>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
