import { MobxLitElement } from "@adobe/lit-mobx";
import { consume } from "@lit/context";
import { html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { reaction, type IReactionDisposer } from "mobx";

import { SIDEBAR_WIDTH } from "../Constants.ts";
import { ZoomDirection } from "../core/Layout.ts";
import { type Layout, layoutContext } from "../core/Layout.ts";
import { type Playback, playbackContext } from "../core/Playback.ts";
import { Rule } from "../core/Rules.ts";
import { type World, worldContext, RuleType } from "../core/World.ts";
import { type AppStore, appStoreContext } from "../stores/AppStore.ts";
import { type DrawerStore, DrawerMode, drawerStoreContext } from "../stores/DrawerStore.ts";
import { getRuleGroups, isValidRule, isNamedRule, getRuleNameByValue } from "../utils/RuleUtils.ts";

import type { Menu } from "@spectrum-web-components/menu";
import type { Picker } from "@spectrum-web-components/picker";
import type { Slider } from "@spectrum-web-components/slider";
import type { Textfield } from "@spectrum-web-components/textfield";
import type { TemplateResult } from "lit";

import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/action-group/sp-action-group.js";
import "@spectrum-web-components/field-label/sp-field-label.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-chevron-double-left.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-chevron-down.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-data.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-full-screen.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-magic-wand.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-pause.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-play.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-settings.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-step-forward.js";
import "@spectrum-web-components/menu/sp-menu-divider.js";
import "@spectrum-web-components/menu/sp-menu-group.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/menu/sp-menu.js";
import "@spectrum-web-components/overlay/overlay-trigger.js";
import "@spectrum-web-components/picker/sp-picker.js";
import "@spectrum-web-components/popover/sp-popover.js";
import "@spectrum-web-components/slider/sp-slider.js";
import "@spectrum-web-components/textfield/sp-textfield.js";
import "@spectrum-web-components/tooltip/sp-tooltip.js";
import "./x-control-group.ts";

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
    .controls {
      background: #f4f5f7;
      border-right: 2px solid #ddd;
      height: 100vh;
      overflow-y: auto;
      padding: 4px 20px;
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
  `;

  @consume({ context: worldContext })
  private accessor _world!: World;

  @consume({ context: layoutContext })
  private accessor _layout!: Layout;

  @consume({ context: playbackContext })
  private accessor _playback!: Playback;

  @consume({ context: drawerStoreContext })
  private accessor _drawerStore!: DrawerStore;

  @consume({ context: appStoreContext })
  private accessor _appStore!: AppStore;

  @state()
  private accessor _customRule: string = Rule.life;

  private _ruleTypeDisposer?: IReactionDisposer;

  private _setRule(e: Event): void {
    const rule = (e.target as Picker).value;

    if (rule === "custom") {
      this._world.setRuleType(RuleType.custom);
    } else {
      this._world.setRule(rule);
      this._world.setRuleType(RuleType.named);
    }
  }

  private _setCustomRule(e: Event): void {
    const customRule = (e.target as Textfield).value;

    this._customRule = customRule;

    if (isValidRule(customRule)) {
      this._world.setRule(customRule);
    }
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
      this._layout.zoomByStep(ZoomDirection.in);
      return;
    }

    if (value === "out") {
      this._layout.zoomByStep(ZoomDirection.out);
      return;
    }

    if (value === "fit") {
      this._layout.zoomToFit();
      return;
    }

    const scale = parseFloat(value);
    this._layout.zoomToScale(scale);
  }

  private _truncateZoomScale(scale: number): number {
    // Multiply by 100 and truncate number to two decimal places for nicer UI
    return Math.round((scale + Number.EPSILON) * 100);
  }

  private _fit(): void {
    this._layout.zoomToFit();
  }

  connectedCallback(): void {
    super.connectedCallback();

    // When the user switches from a named rule to a custom rule,
    // we need to update the local custom rule state to match the world rule
    this._ruleTypeDisposer = reaction(
      () => this._world.ruleType,
      () => {
        if (this._world.ruleType === RuleType.custom) {
          this._customRule = this._world.rule;
        }
      },
      { fireImmediately: true }
    );
  }

  disconnectedCallback(): void {
    this._ruleTypeDisposer?.();

    super.disconnectedCallback();
  }

  protected render(): TemplateResult {
    return html`
      <div class="controls">
        <x-control-group label="Rule">
          <sp-action-group size="m">
            <sp-picker
              id="rule"
              value=${this._world.ruleType === RuleType.custom ? "custom" : this._world.rule}
              @change=${this._setRule}
              label="Rule"
            >
              ${getRuleGroups().map(({ name, rules }) => {
                return html`
                  <sp-menu-group>
                    <span slot="header">${name}</span>
                    ${rules.map(([ruleName, ruleValue]) => {
                      return html`<sp-menu-item value=${ruleValue}>${ruleName}</sp-menu-item>`;
                    })}
                  </sp-menu-group>
                `;
              })}
              <sp-menu-group>
                <span slot="header">Other</span>
                <sp-menu-item value="custom">Custom</sp-menu-item>
              </sp-menu-group>
            </sp-picker>
          </sp-action-group>

          ${when(
            this._world.ruleType === RuleType.custom,
            () => html`
              <sp-field-label for="custom-rule"
                >Rulestring (e.g. B3/S23)
                ${when(
                  isNamedRule(this._customRule),
                  () => html`<strong>[${getRuleNameByValue(this._customRule as Rule)}]</strong>`
                )}</sp-field-label
              >
              <sp-textfield
                id="custom-rule"
                value=${this._customRule}
                ?invalid=${!isValidRule(this._customRule)}
                @input=${this._setCustomRule}
              ></sp-textfield>
            `
          )}
        </x-control-group>

        <x-control-group label="World">
          <sp-action-group size="m">
            <overlay-trigger triggered-by="hover">
              <sp-action-button slot="trigger" @click="${this._randomize}" label="Randomize">
                <sp-icon-magic-wand slot="icon"></sp-icon-magic-wand>
                Randomize
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Randomize (W)</sp-tooltip>
            </overlay-trigger>

            <overlay-trigger triggered-by="hover">
              <sp-action-button
                slot="trigger"
                @click="${() => this._drawerStore.toggleDrawer(DrawerMode.settings)}"
                label="Settings"
              >
                <sp-icon-settings slot="icon"></sp-icon-settings>
                Settings
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Open settings (S)</sp-tooltip>
            </overlay-trigger>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Playback">
          <sp-action-group size="m">
            <overlay-trigger triggered-by="hover">
              <sp-action-button slot="trigger" @click="${this._rewind}" label="Rewind">
                <sp-icon-chevron-double-left slot="icon"></sp-icon-chevron-double-left>
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Rewind (R)</sp-tooltip>
            </overlay-trigger>

            <overlay-trigger triggered-by="hover">
              <sp-action-button slot="trigger" @click="${this._togglePlaying}" label="Toggle playback">
                ${this._playback.playing
                  ? html`<sp-icon-pause slot="icon"></sp-icon-pause>`
                  : html`<sp-icon-play slot="icon"></sp-icon-play>`}
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Toggle playback (Space)</sp-tooltip>
            </overlay-trigger>

            <overlay-trigger triggered-by="hover">
              <sp-action-button
                slot="trigger"
                @click="${this._tick}"
                ?disabled=${this._playback.playing}
                label="Step forward"
              >
                <sp-icon-step-forward slot="icon"></sp-icon-step-forward>
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Step forward (T)</sp-tooltip>
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

        <x-control-group label="Layout">
          <sp-action-group size="m">
            <overlay-trigger triggered-by="click">
              <sp-action-button slot="trigger" class="zoom-button" label="Zoom">
                <sp-icon-chevron-down slot="icon"></sp-icon-chevron-down>
                ${this._truncateZoomScale(this._layout.zoomScale)}%
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
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Zoom to fit (F)</sp-tooltip>
            </overlay-trigger>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Patterns" noDivider>
          <sp-action-group size="m">
            <overlay-trigger triggered-by="hover">
              <sp-action-button
                slot="trigger"
                @click="${() => this._drawerStore.toggleDrawer(DrawerMode.patternLibrary)}"
                label="Library"
              >
                <sp-icon-data slot="icon"></sp-icon-data>
                Library
              </sp-action-button>
              <sp-tooltip slot="hover-content" placement="bottom" delayed>Open pattern library (L)</sp-tooltip>
            </overlay-trigger>
          </sp-action-group>
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
