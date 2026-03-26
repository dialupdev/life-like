import { MobxLitElement } from "@adobe/lit-mobx";
import { html, css } from "lit";
import { customElement } from "lit/decorators.js";

import { SIDEBAR_WIDTH } from "../Constants.ts";

import type { TemplateResult } from "lit";

import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/spectrum-two/scale-medium.js";
import "@spectrum-web-components/theme/spectrum-two/theme-light.js";
import "./x-drawer.ts";
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

  protected render(): TemplateResult {
    return html`
      <sp-theme system="spectrum-two" scale="medium" color="light">
        <slot></slot>

        <x-sidebar></x-sidebar>
        <x-drawer></x-drawer>
        <x-hud></x-hud>
      </sp-theme>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
