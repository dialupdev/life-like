import { MobxLitElement } from "@adobe/lit-mobx";
import { Menu } from "@spectrum-web-components/menu";
import { Picker } from "@spectrum-web-components/picker";
import { Slider } from "@spectrum-web-components/slider";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import { Rule } from "../core/Config";
import { ZoomDirection } from "../core/Layout";
import { AppStore } from "../stores/AppStore";
import { ConfigStore } from "../stores/ConfigStore";
import { LayoutStore } from "../stores/LayoutStore";
import { PlaybackStore } from "../stores/PlaybackStore";
import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/action-group/sp-action-group.js";
import "@spectrum-web-components/field-label/sp-field-label.js";
import "@spectrum-web-components/menu/sp-menu-divider.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/menu/sp-menu.js";
import "@spectrum-web-components/overlay/overlay-trigger.js";
import "@spectrum-web-components/picker/sp-picker.js";
import "@spectrum-web-components/popover/sp-popover.js";
import "@spectrum-web-components/slider/sp-slider.js";
import "@spectrum-web-components/theme/scale-medium.js";
import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/theme-light.js";
import "./x-control-group";

@customElement("x-app")
class App extends MobxLitElement {
  public static styles = css`
    :host {
      background: #f4f5f7;
      border-right: 2px solid #ddd;
      box-sizing: border-box;
      display: block;
      height: 100vh;
      left: 0;
      padding: 20px;
      position: absolute;
      top: 0;
      width: ${SIDEBAR_WIDTH}px;
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

  @property({ attribute: false })
  public configStore!: ConfigStore;

  @property({ attribute: false })
  public layoutStore!: LayoutStore;

  @property({ attribute: false })
  public playbackStore!: PlaybackStore;

  @property({ attribute: false })
  public appStore!: AppStore;

  private _togglePlaying(): void {
    this.playbackStore.togglePlaying();
  }

  private _tick(): void {
    this.playbackStore.tickLazy();
  }

  private _changeRule(e: Event): void {
    const rule = (e.target as Picker).value as Rule;
    this.configStore.setRule(rule);
  }

  private _setFrameRate(e: Event): void {
    const frameRate = (e.target as Slider).value;
    this.configStore.setFrameRate(frameRate);
  }

  private _zoomToScale(e: Event): void {
    const value = (e.target as Menu).value;

    if (value === "in") {
      this.layoutStore.zoomByStep(ZoomDirection.In);
      return;
    }

    if (value === "out") {
      this.layoutStore.zoomByStep(ZoomDirection.Out);
      return;
    }

    if (value === "fit") {
      this.layoutStore.zoomToFit();
      return;
    }

    const scale = parseFloat(value);
    this.layoutStore.zoomToScale(scale);
  }

  private _fit(): void {
    this.layoutStore.zoomToFit();
  }

  private _reset(): void {
    this.appStore.reset();
  }

  protected render(): TemplateResult {
    return html`
      <sp-theme color="light" scale="medium">
        <x-control-group label="Playback">
          <sp-action-group size="m">
            <sp-action-button @click="${this._togglePlaying}"
              >${this.playbackStore.playing ? "Pause" : "Play"} (Space)</sp-action-button
            >
            <sp-action-button @click="${this._tick}" ?disabled=${this.playbackStore.playing}>Tick (T)</sp-action-button>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Frame rate">
          <sp-slider
            min="1"
            max="60"
            step="1"
            variant="filled"
            value=${this.configStore.frameRate}
            @input="${this._setFrameRate}"
          ></sp-slider>
        </x-control-group>

        <x-control-group label="Zoom">
          <overlay-trigger>
            <sp-action-button slot="trigger" caret>${this.layoutStore.zoomScale}%</sp-action-button>
            <sp-popover open slot="click-content" class="zoom-menu">
              <sp-menu @change=${this._zoomToScale}>
                <sp-menu-item value="in"
                  >Zoom in
                  <span class="shortcut" slot="value"
                    ><span class="char">⌘</span><span class="char">=</span></span
                  ></sp-menu-item
                >
                <sp-menu-item value="out"
                  >Zoom out
                  <span class="shortcut" slot="value"
                    ><span class="char">⌘</span><span class="char">-</span></span
                  ></sp-menu-item
                >
                <sp-menu-divider size="s"></sp-menu-divider>
                <sp-menu-item value=".1">10%</sp-menu-item>
                <sp-menu-item value=".25">25%</sp-menu-item>
                <sp-menu-item value=".5">50%</sp-menu-item>
                <sp-menu-item value="1"
                  >100%
                  <span class="shortcut" slot="value"
                    ><span class="char">⌘</span><span class="char">1</span></span
                  ></sp-menu-item
                >
                <sp-menu-item value="1.5">150%</sp-menu-item>
                <sp-menu-item value="2"
                  >200%
                  <span class="shortcut" slot="value"
                    ><span class="char">⌘</span><span class="char">2</span></span
                  ></sp-menu-item
                >
                <sp-menu-item value="4">400%</sp-menu-item>
                <sp-menu-divider size="s"></sp-menu-divider>
                <sp-menu-item value="fit"
                  >Zoom to fit
                  <span class="shortcut" slot="value"
                    ><span class="char">⌘</span><span class="char">0</span></span
                  ></sp-menu-item
                >
              </sp-menu>
            </sp-popover>
          </overlay-trigger>
        </x-control-group>

        <x-control-group label="Reset">
          <sp-action-group size="m">
            <sp-action-button @click="${this._fit}">Fit (F)</sp-action-button>
            <sp-action-button @click="${this._reset}">Reset (R)</sp-action-button>
          </sp-action-group>
        </x-control-group>

        <x-control-group label="Config">
          <sp-field-label for="rule">Rule</sp-field-label>
          <sp-picker id="rule" value=${this.configStore.rule} @change=${this._changeRule}>
            ${this.configStore.getAllRules().map(([name, value]) => {
              return html`<sp-menu-item value=${value}>${name}</sp-menu-item>`;
            })}
          </sp-picker>
        </x-control-group>
      </sp-theme>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
