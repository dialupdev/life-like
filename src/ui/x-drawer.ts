import { MobxLitElement } from "@adobe/lit-mobx";
import { consume } from "@lit/context";
import { html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import { classMap } from "lit/directives/class-map.js";

import { SIDEBAR_WIDTH } from "../Constants";
import { type DrawerStore, DrawerMode, drawerStoreContext } from "../stores/DrawerStore.ts";

import type { TemplateResult } from "lit";

import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-close.js";
import "./x-control-group";
import "./x-pattern-library";
import "./x-settings";

type DrawerCase = [DrawerMode, () => TemplateResult];

@customElement("x-drawer")
class Drawer extends MobxLitElement {
  public static styles = css`
    * {
      box-sizing: border-box;
    }
    :host {
      display: block;
      left: 0;
      position: absolute;
      top: 0;
      width: ${SIDEBAR_WIDTH}px;
    }
    .drawer {
      background: #f4f5f7;
      border-right: 2px solid #ddd;
      height: 100vh;
      left: 0;
      overflow-y: auto;
      padding: 4px 20px;
      position: absolute;
      top: 0;
      transition: left 0.2s;
      width: ${SIDEBAR_WIDTH}px;
    }
    .drawer.open {
      left: ${SIDEBAR_WIDTH}px;
    }
    .close-drawer-button {
      position: absolute;
      right: 5px;
      top: 5px;
    }
  `;

  @consume({ context: drawerStoreContext })
  private accessor _drawerStore!: DrawerStore;

  private get _drawerCases(): DrawerCase[] {
    return [
      [DrawerMode.settings, () => html`<x-settings></x-settings>`],
      [
        DrawerMode.patternLibrary,
        () => html`<x-pattern-library></x-pattern-library>`,
      ],
    ];
  }

  private _closeDrawer(): void {
    this._drawerStore.closeDrawer();
  }

  protected render(): TemplateResult {
    return html`
      <div
        class=${classMap({
          drawer: true,
          open: this._drawerStore.drawerOpen,
        })}
      >
        <x-control-group label=${this._drawerStore.drawerMode} noDivider>
          <sp-action-button class="close-drawer-button" quiet @click="${this._closeDrawer}">
            <sp-icon-close slot="icon"></sp-icon-close>
          </sp-action-button>

          ${choose(this._drawerStore.drawerMode, this._drawerCases)}
        </x-control-group>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-drawer": Drawer;
  }
}
