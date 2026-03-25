import { MobxLitElement } from "@adobe/lit-mobx";
import { consume } from "@lit/context";
import { html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import { classMap } from "lit/directives/class-map.js";

import { SIDEBAR_WIDTH } from "../Constants.ts";
import { type Playback, playbackContext } from "../core/Playback.ts";
import { ZoomDirection } from "../core/Renderer.ts";
import { type Renderer, rendererContext } from "../core/Renderer.ts";
import { type World, worldContext } from "../core/World.ts";
import { type AppStore, appStoreContext } from "../stores/AppStore.ts";
import { DrawerMode } from "../stores/DrawerStore.ts";
import { type DrawerStore, drawerStoreContext } from "../stores/DrawerStore.ts";
import { getAllRules } from "../utils/RuleUtils.ts";

import type { Rule } from "../core/Rules.ts";
import type { Menu } from "@spectrum-web-components/menu";
import type { Picker } from "@spectrum-web-components/picker";
import type { Slider } from "@spectrum-web-components/slider";
import type { TemplateResult } from "lit";

import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/action-group/sp-action-group.js";
import "@spectrum-web-components/field-label/sp-field-label.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-chevron-double-left.js";
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
import "@spectrum-web-components/tooltip/sp-tooltip.js";
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

  @consume({ context: worldContext })
  private accessor _world!: World;

  @consume({ context: rendererContext })
  private accessor _renderer!: Renderer;

  @consume({ context: playbackContext })
  private accessor _playback!: Playback;

  @consume({ context: drawerStoreContext })
  private accessor _drawerStore!: DrawerStore;

  @consume({ context: appStoreContext })
  private accessor _appStore!: AppStore;

  private get _drawerCases(): DrawerCase[] {
    return [
      [DrawerMode.settings, () => html`<x-settings></x-settings>`],
      [
        DrawerMode.patternLibrary,
        () => html`<x-pattern-library></x-pattern-library>`,
      ],
    ];
  }

  private _randomize(): void {
    this._appStore.randomize();
  }

  private _rewind(): void {
    this._appStore.rewind();
  }

  private _togglePlaying(): void {
    this._playback.togglePlaying();
  }

  private _tick(): void {
    this._playback.tickLazy();
  }

  private _setFrameRateLimit(e: Event): void {
    const frameRateLimit = (e.target as Slider).value;
    this._playback.setFrameRateLimit(frameRateLimit);
  }

  private _zoomToScale(e: Event): void {
    const value = (e.target as Menu).value;

    if (value === "in") {
      this._renderer.zoomByStep(ZoomDirection.in);
      return;
    }

    if (value === "out") {
      this._renderer.zoomByStep(ZoomDirection.out);
      return;
    }

    if (value === "fit") {
      this._renderer.zoomToFit();
      return;
    }

    const scale = parseFloat(value);
    this._renderer.zoomToScale(scale);
  }

  private _truncateZoomScale(scale: number): number {
    // Multiply by 100 and truncate number to two decimal places for nicer UI
    return Math.round((scale + Number.EPSILON) * 100);
  }

  private _fit(): void {
    this._renderer.zoomToFit();
  }

  private _setRule(e: Event): void {
    const rule = (e.target as Picker).value as Rule;
    this._world.setRule(rule);
  }

  private _closeDrawer(): void {
    this._drawerStore.closeDrawer();
  }

  protected render(): TemplateResult {
    return html`
      <div class="controls">
        <x-control-group label="World">
          <sp-action-group size="m">
            <overlay-trigger triggered-by="hover">
              <sp-action-button slot="trigger" @click="${this._randomize}" label="Randomize">
                <sp-icon-magic-wand slot="icon"></sp-icon-magic-wand>
                Randomize
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Randomize (w)</sp-tooltip>
            </overlay-trigger>

            <overlay-trigger triggered-by="hover">
              <sp-action-button
                slot="trigger"
                @click="${() => this._drawerStore.toggleDrawer(DrawerMode.settings)}"
                ?selected=${this._drawerStore.drawerMode === DrawerMode.settings}
                label="Settings"
              >
                <sp-icon-settings slot="icon"></sp-icon-settings>
                Settings
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Open settings (s)</sp-tooltip>
            </overlay-trigger>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Playback">
          <sp-action-group size="m">
            <overlay-trigger triggered-by="hover">
              <sp-action-button slot="trigger" @click="${this._rewind}" label="Rewind">
                <sp-icon-chevron-double-left slot="icon"></sp-icon-chevron-double-left>
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Rewind (r)</sp-tooltip>
            </overlay-trigger>

            <overlay-trigger triggered-by="hover">
              <sp-action-button slot="trigger" @click="${this._togglePlaying}" label="Toggle playback">
                ${
                  this._playback.playing
                    ? html`
                        <sp-icon-pause slot="icon"></sp-icon-pause>
                      `
                    : html`
                        <sp-icon-play slot="icon"></sp-icon-play>
                      `
                }
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Toggle playback (space)</sp-tooltip>
            </overlay-trigger>

            <overlay-trigger triggered-by="hover">
              <sp-action-button slot="trigger" @click="${this._tick}" ?disabled=${this._playback.playing} label="Step forward">
                <sp-icon-step-forward slot="icon"></sp-icon-step-forward>
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Step forward (t)</sp-tooltip>
            </overlay-trigger>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Frame rate limit">
          <sp-slider
            min="1"
            max="120"
            step="1"
            variant="filled"
            value=${this._playback.frameRateLimit}
            @input="${this._setFrameRateLimit}"
          >
          </sp-slider>
        </x-control-group>

        <x-control-group label="Zoom">
          <sp-action-group size="m">
            <overlay-trigger triggered-by="click">
              <sp-action-button slot="trigger" class="zoom-button" label="Zoom">
                <sp-icon-chevron-down slot="icon"></sp-icon-chevron-down>
                ${this._truncateZoomScale(this._renderer.zoomScale)}%
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

            <overlay-trigger triggered-by="hover">
              <sp-action-button slot="trigger" @click="${this._fit}" label="Fit">
                <sp-icon-full-screen slot="icon"></sp-icon-full-screen>
                Fit
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Zoom to fit (f)</sp-tooltip>
            </overlay-trigger>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Rule">
          <sp-action-group size="m">
            <sp-picker id="rule" value=${this._world.rule} @change=${this._setRule} label="Rule">
              ${getAllRules().map(([name, value]) => {
                return html`<sp-menu-item value=${value}>${name}</sp-menu-item>`;
              })}
            </sp-picker>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Patterns" noDivider>
          <sp-action-group size="m">
            <overlay-trigger triggered-by="hover">
              <sp-action-button
                slot="trigger"
                @click="${() => this._drawerStore.toggleDrawer(DrawerMode.patternLibrary)}"
                ?selected=${this._drawerStore.drawerMode === DrawerMode.patternLibrary}
                label="Library"
              >
                <sp-icon-data slot="icon"></sp-icon-data>
                Library
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Open pattern library (l)</sp-tooltip>
            </overlay-trigger>
          </sp-action-group>
        </x-control-group>
      </div>

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
    "x-sidebar": Sidebar;
  }
}
