import { MobxLitElement } from "@adobe/lit-mobx";
import { SlRange, SlSelect, SlChangeEvent } from "@shoelace-style/shoelace";
import { TemplateResult, html, css } from "lit";
import { query } from "lit/decorators/query.js";
import { customElement, property } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import { AppController } from "../controllers/AppController";
import { ConfigController } from "../controllers/ConfigController";
import { LayoutController } from "../controllers/LayoutController";
import { PlaybackController } from "../controllers/PlaybackController";
import { Rule } from "../core/Config";
import { ZoomDirection } from "../core/Layout";
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
  public configController!: ConfigController;

  @property({ attribute: false })
  public layoutController!: LayoutController;

  @property({ attribute: false })
  public playbackController!: PlaybackController;

  @property({ attribute: false })
  public appController!: AppController;

  @query(".range-with-custom-formatter")
  private speedRange!: SlRange;

  private _changeRule(e: Event): void {
    const rule = (e.target as SlSelect).value as Rule;
    this.configController.setRule(rule);
  }

  private _togglePlaying(): void {
    this.playbackController.togglePlaying();
  }

  private _tick(): void {
    this.playbackController.tickLazy();
  }

  private _setFrameRate(e: SlChangeEvent): void {
    const frameRate = (e.target as SlRange).value;
    this.playbackController.setFrameRate(frameRate);
  }

  private _zoomToScale(e: CustomEvent): void {
    const value = e.detail.item.value;

    if (value === "in") {
      this.layoutController.zoomByStep(ZoomDirection.In);
      return;
    }

    if (value === "out") {
      this.layoutController.zoomByStep(ZoomDirection.Out);
      return;
    }

    if (value === "fit") {
      this.layoutController.zoomToFit();
      return;
    }

    const scale = parseFloat(value);
    this.layoutController.zoomToScale(scale);
  }

  private _fit(): void {
    this.layoutController.zoomToFit();
  }

  private _reset(): void {
    this.appController.reset();
  }

  public firstUpdated(): void {
    this.speedRange.tooltipFormatter = value => `${value} FPS`;
  }

  protected render(): TemplateResult {
    return html`
      <x-control-group label="Playback">
        <sl-button size="small" variant="primary" outline @click="${this._togglePlaying}">
          ${this.playbackController.playing ? "Pause" : "Play"} (Space)
        </sl-button>
        <sl-button size="small" variant="primary" outline @click="${this._tick}" ?disabled=${
          this.playbackController.playing
        }>Tick (T)</sl-button>
      </x-control-group>

      <x-control-group label="Frame rate">
        <sl-range min="1" max="30" step="1" value=${this.playbackController.frameRate} @sl-input="${
          this._setFrameRate
        }" tooltip="bottom" class="range-with-custom-formatter" style="--tooltip-offset: 20px;"></sl-range>
      </x-control-group>

      <x-control-group label="Zoom">
        <sl-dropdown stay-open-on-select>
          <sl-button size="small" slot="trigger" caret>${this.layoutController.zoomScale}%</sl-button>
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
        <sl-select size="small" label="Rule" value=${this.configController.getRule()} @sl-change=${this._changeRule}>
          ${this.configController.getAllRules().map(([name, value]) => {
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
