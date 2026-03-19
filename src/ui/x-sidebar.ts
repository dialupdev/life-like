import { MobxLitElement } from "@adobe/lit-mobx";
import { html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import { classMap } from "lit/directives/class-map.js";

import { SIDEBAR_WIDTH } from "../Constants.ts";
import { ZoomDirection } from "../core/Renderer.ts";
import { DrawerMode } from "../stores/DrawerStore.ts";
import { getAllRules } from "../utils/RuleUtils.ts";

import type { Rule } from "../core/Rules.ts";
import type { Locator } from "../Locator.ts";
import type { Menu } from "@spectrum-web-components/menu";
import type { Picker } from "@spectrum-web-components/picker";
import type { Slider } from "@spectrum-web-components/slider";
import type { TemplateResult } from "lit";

import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/action-group/sp-action-group.js";
import "@spectrum-web-components/field-label/sp-field-label.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-chevron-down.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-close.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-data.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-full-screen.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-magic-wand.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-pause.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-play.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-settings.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-step-forward.js";
import "@spectrum-web-components/menu/sp-menu-divider.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/menu/sp-menu.js";
import "@spectrum-web-components/overlay/overlay-trigger.js";
import "@spectrum-web-components/picker/sp-picker.js";
import "@spectrum-web-components/popover/sp-popover.js";
import "@spectrum-web-components/slider/sp-slider.js";
import "./x-control-group.ts";
import "./x-pattern-library.ts";
import "./x-settings.ts";

type DrawerCase = [DrawerMode, () => TemplateResult];

@customElement("x-sidebar")
class Sidebar extends MobxLitElement {
  public static styles = css`
    * {
      box-sizing: border-box;
    }
    :host {
      display: block;
      width: ${SIDEBAR_WIDTH}px;
    }
    .controls,
    .drawer {
      border-right: 2px solid #ddd;
      height: 100vh;
      overflow-y: auto;
      padding: 4px 20px;
    }
    .controls {
      background: #f4f5f7;
      position: relative;
      z-index: 1;
    }
    .zoom-button {
      flex-direction: row-reverse;
    }
    .zoom-menu {
      width: 240px;
    }
    .shortcut .char {
      display: inline-block;
      text-align: center;
      width: 1.1em;
    }
    .drawer {
      background: #f4f5f7;
      left: 0;
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

  @property()
  public accessor locator!: Locator;

  private get _drawerCases(): DrawerCase[] {
    return [
      [DrawerMode.settings, () => html`<x-settings .locator=${this.locator}></x-settings>`],
      [DrawerMode.patternLibrary, () => html`<x-pattern-library .locator=${this.locator}></x-pattern-library>`],
    ];
  }

  private _randomize(): void {
    this.locator.appStore.randomize();
  }

  private _togglePlaying(): void {
    this.locator.playback.togglePlaying();
  }

  private _tick(): void {
    this.locator.playback.tickLazy();
  }

  private _setFrameRate(e: Event): void {
    const frameRate = (e.target as Slider).value;
    this.locator.playback.setFrameRate(frameRate);
  }

  private _zoomToScale(e: Event): void {
    const value = (e.target as Menu).value;

    if (value === "in") {
      this.locator.renderer.zoomByStep(ZoomDirection.in);
      return;
    }

    if (value === "out") {
      this.locator.renderer.zoomByStep(ZoomDirection.out);
      return;
    }

    if (value === "fit") {
      this.locator.renderer.zoomToFit();
      return;
    }

    const scale = parseFloat(value);
    this.locator.renderer.zoomToScale(scale);
  }

  private _truncateZoomScale(scale: number): number {
    // Multiply by 100 and truncate number to two decimal places for nicer UI
    return Math.round((scale + Number.EPSILON) * 100);
  }

  private _fit(): void {
    this.locator.renderer.zoomToFit();
  }

  private _setRule(e: Event): void {
    const rule = (e.target as Picker).value as Rule;
    this.locator.world.setRule(rule);
  }

  private _closeDrawer(): void {
    this.locator.drawerStore.closeDrawer();
  }

  protected render(): TemplateResult {
    return html`
      <div class="controls">
        <x-control-group label="World">
          <sp-action-group size="m">
            <sp-action-button @click="${this._randomize}" label="Randomize">
              <sp-icon-magic-wand slot="icon"></sp-icon-magic-wand>
              Randomize
            </sp-action-button>

            <sp-action-button
              @click="${() => this.locator.drawerStore.toggleDrawer(DrawerMode.settings)}"
              ?selected=${this.locator.drawerStore.drawerMode === DrawerMode.settings}
            >
              <sp-icon-settings slot="icon"></sp-icon-settings>
              Settings
            </sp-action-button>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Playback">
          <sp-action-group size="m">
            <sp-action-button @click="${this._togglePlaying}" label="Toggle playback">
              ${
                this.locator.playback.playing
                  ? html`
                      <sp-icon-pause slot="icon"></sp-icon-pause>
                    `
                  : html`
                      <sp-icon-play slot="icon"></sp-icon-play>
                    `
              }
            </sp-action-button>
            <sp-action-button @click="${this._tick}" ?disabled=${this.locator.playback.playing} label="Step forward">
              <sp-icon-step-forward slot="icon"></sp-icon-step-forward>
            </sp-action-button>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Frame rate">
          <sp-slider
            min="1"
            max="120"
            step="1"
            variant="filled"
            value=${this.locator.playback.frameRate}
            @input="${this._setFrameRate}"
          >
          </sp-slider>
        </x-control-group>

        <x-control-group label="Zoom">
          <sp-action-group size="m">
            <overlay-trigger triggered-by="click">
              <sp-action-button slot="trigger" class="zoom-button">
                <sp-icon-chevron-down slot="icon"></sp-icon-chevron-down>
                ${this._truncateZoomScale(this.locator.renderer.zoomScale)}%
              </sp-action-button>
              <sp-popover slot="click-content" direction="bottom" class="zoom-menu">
                <sp-menu @change=${this._zoomToScale}>
                  <sp-menu-item value="in">
                    Zoom in
                    <span class="shortcut" slot="value"> <span class="char">⌘</span><span class="char">=</span></span>
                  </sp-menu-item>
                  <sp-menu-item value="out">
                    Zoom out
                    <span class="shortcut" slot="value"><span class="char">⌘</span><span class="char">-</span></span>
                  </sp-menu-item>
                  <sp-menu-divider size="s"></sp-menu-divider>
                  <sp-menu-item value=".1">10%</sp-menu-item>
                  <sp-menu-item value=".25">25%</sp-menu-item>
                  <sp-menu-item value=".5">50%</sp-menu-item>
                  <sp-menu-item value="1">
                    100%
                    <span class="shortcut" slot="value"><span class="char">⌘</span><span class="char">1</span></span>
                  </sp-menu-item>
                  <sp-menu-item value="1.5">150%</sp-menu-item>
                  <sp-menu-item value="2">
                    200%
                    <span class="shortcut" slot="value"><span class="char">⌘</span><span class="char">2</span></span>
                  </sp-menu-item>
                  <sp-menu-item value="4">400%</sp-menu-item>
                  <sp-menu-divider size="s"></sp-menu-divider>
                  <sp-menu-item value="fit">
                    Zoom to fit
                    <span class="shortcut" slot="value"><span class="char">⌘</span><span class="char">0</span></span>
                  </sp-menu-item>
                </sp-menu>
              </sp-popover>
            </overlay-trigger>
            
            <sp-action-button @click="${this._fit}">
              <sp-icon-full-screen slot="icon"></sp-icon-full-screen>
              Fit
            </sp-action-button>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Rule">
          <sp-action-group size="m">
            <sp-picker id="rule" value=${this.locator.world.rule} @change=${this._setRule}>
              ${getAllRules().map(([name, value]) => {
                return html`<sp-menu-item value=${value}>${name}</sp-menu-item>`;
              })}
            </sp-picker>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Patterns" noDivider>
          <sp-action-group size="m">
            <sp-action-button
              @click="${() => this.locator.drawerStore.toggleDrawer(DrawerMode.patternLibrary)}"
              ?selected=${this.locator.drawerStore.drawerMode === DrawerMode.patternLibrary}
            >
              <sp-icon-data slot="icon"></sp-icon-data>
              Library
            </sp-action-button>
          </sp-action-group>
        </x-control-group>
      </div>

      <div
        class=${classMap({
          drawer: true,
          open: this.locator.drawerStore.drawerOpen,
        })}
      >
        <x-control-group label=${this.locator.drawerStore.drawerMode} noDivider>
          <sp-action-button class="close-drawer-button" quiet @click="${this._closeDrawer}">
            <sp-icon-close slot="icon"></sp-icon-close>
          </sp-action-button>
          ${choose(this.locator.drawerStore.drawerMode, this._drawerCases)}
        </x-control-group>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-sidebar": Sidebar;
  }
}
