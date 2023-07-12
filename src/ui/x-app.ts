import { MobxLitElement } from "@adobe/lit-mobx";
import { SlRange, SlSelect, SlChangeEvent } from "@shoelace-style/shoelace";
import { TemplateResult, html, css } from "lit";
import { query } from "lit/decorators/query.js";
import { customElement, property } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import { Rule } from "../core/Config";
import { ZoomDirection } from "../core/Layout";
import { AppStore } from "../stores/AppStore";
import { ConfigStore } from "../stores/ConfigStore";
import { LayoutStore } from "../stores/LayoutStore";
import { PlaybackStore } from "../stores/PlaybackStore";
import "@shoelace-style/shoelace/dist/themes/light.css";
import "@shoelace-style/shoelace/dist/components/button-group/button-group.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dropdown/dropdown.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js";
import "@shoelace-style/shoelace/dist/components/menu/menu.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";
import "@shoelace-style/shoelace/dist/components/range/range.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/tooltip/tooltip.js";
import "./x-control-group";

@customElement("x-app")
class App extends MobxLitElement {
  public static styles = css`
    :host {
      background: #f4f5f7;
      border-right: 2px solid #ddd;
      box-sizing: border-box;
      display: block;
      font-family: var(--sl-font-sans);
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
      color: var(--sl-color-neutral-400);
      display: inline-block;
      font-size: var(--sl-font-size-small);
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

  @query(".range-with-custom-formatter")
  private speedRange!: SlRange;

  private _changeRule(e: Event): void {
    const rule = (e.target as SlSelect).value as Rule;
    this.configStore.setRule(rule);
  }

  private _togglePlaying(): void {
    this.playbackStore.togglePlaying();
  }

  private _tick(): void {
    this.playbackStore.tickLazy();
  }

  private _setFrameRate(e: SlChangeEvent): void {
    const frameRate = (e.target as SlRange).value;
    this.configStore.setFrameRate(frameRate);
  }

  private _zoomToScale(e: CustomEvent): void {
    const value = e.detail.item.value;

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

  public firstUpdated(): void {
    this.speedRange.tooltipFormatter = value => `${value} FPS`;
  }

  protected render(): TemplateResult {
    return html`
      <x-control-group label="Playback">
        <sl-button size="small" variant="primary" outline @click="${this._togglePlaying}">
          ${this.playbackStore.playing ? "Pause" : "Play"} (Space)
        </sl-button>
        <sl-button size="small" variant="primary" outline @click="${this._tick}" ?disabled=${
          this.playbackStore.playing
        }>Tick (T)</sl-button>
      </x-control-group>

      <x-control-group label="Frame rate">
        <sl-range min="1" max="60" step="1" value=${this.configStore.frameRate} @sl-input="${
          this._setFrameRate
        }" tooltip="bottom" class="range-with-custom-formatter" style="--tooltip-offset: 20px;"></sl-range>
      </x-control-group>

      <x-control-group label="Zoom">
        <sl-dropdown stay-open-on-select>
          <sl-button size="small" slot="trigger" caret>${this.layoutStore.zoomScale}%</sl-button>
          <sl-menu class="zoom-menu" @sl-select=${this._zoomToScale}>
            <sl-menu-item value="in">Zoom in <span class="shortcut" slot="suffix"><span class="char">⌘</span><span class="char">=</span></span></sl-menu-item>
            <sl-menu-item value="out">Zoom out <span class="shortcut" slot="suffix"><span class="char">⌘</span><span class="char">-</span></span></sl-menu-item>
            <sl-divider></sl-divider>
            <sl-menu-item value=".1">10%</sl-menu-item>
            <sl-menu-item value=".25">25%</sl-menu-item>
            <sl-menu-item value=".5">50%</sl-menu-item>
            <sl-menu-item value="1">100% <span class="shortcut" slot="suffix"><span class="char">⌘</span><span class="char">1</span></span></sl-menu-item>
            <sl-menu-item value="1.5">150%</sl-menu-item>
            <sl-menu-item value="2">200% <span class="shortcut" slot="suffix"><span class="char">⌘</span><span class="char">2</span></span></sl-menu-item>
            <sl-menu-item value="4">400%</sl-menu-item>
            <sl-divider></sl-divider>
            <sl-menu-item value="fit">Zoom to fit <span class="shortcut" slot="suffix"><span class="char">⌘</span><span class="char">0</span></span></sl-menu-item>
          </sl-menu>
        </sl-dropdown>
      </x-control-group>

      <x-control-group label="Reset">
        <sl-button size="small" variant="success" outline @click="${this._fit}">Fit (F)</sl-button>
        <sl-button size="small" variant="danger" outline @click="${this._reset}">Reset (R)</sl-button>
      </x-control-group></x-control-group>

      <x-control-group label="Config">
        <sl-select size="small" label="Rule" value=${this.configStore.rule} @sl-change=${this._changeRule}>
          ${this.configStore.getAllRules().map(([name, value]) => {
            return html`<sl-option value=${value}>${name}</sl-option>`;
          })}
        </sl-select>
      </x-control-group>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
