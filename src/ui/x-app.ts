import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import { AppController } from "../controllers/AppController";
import { ConfigController, Rule } from "../controllers/ConfigController";
import { LayoutController, ZoomDirection } from "../controllers/LayoutController";
import "@shoelace-style/shoelace/dist/themes/light.css";
import "@shoelace-style/shoelace/dist/components/button-group/button-group.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/dropdown/dropdown.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js";
import "@shoelace-style/shoelace/dist/components/menu/menu.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";
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

  @property()
  public configController!: ConfigController;

  @property()
  public layoutController!: LayoutController;

  @property()
  public appController!: AppController;

  private _changeRule(e: Event): void {
    const rule = parseInt((e.target as HTMLSelectElement).value, 10) as Rule;
    this.configController.setRule(rule);
  }

  private _center(): void {
    this.layoutController.zoomToFit();
  }

  private _tick(): void {
    this.appController.tick();
  }

  private _play(): void {
    this.appController.play();
  }

  private _pause(): void {
    this.appController.pause();
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

  private _reset(): void {
    this.appController.reset();
  }

  protected render(): TemplateResult {
    return html`
      <x-control-group label="Playback">
        <sl-button size="small" variant="primary" outline @click="${this._tick}" ?disabled=${
      this.appController.playing
    }>Tick (T)</sl-button>
        <sl-button size="small" variant="primary" outline @click="${
          this.appController.playing ? this._pause : this._play
        }">
          ${this.appController.playing ? "Pause" : "Play"} (P)
        </sl-button>
      </x-control-group>

      <x-control-group label="Zoom">
        <sl-dropdown stay-open-on-select>
          <sl-button slot="trigger" caret>${this.layoutController.zoomScale}%</sl-button>
          <sl-menu class="zoom-menu" @sl-select=${this._zoomToScale}>
            <sl-menu-item value="in">Zoom in <span class="shortcut" slot="suffix"><span class="char">⌘</span><span class="char">=</span></span></sl-menu-item>
            <sl-menu-item value="out">Zoom out <span class="shortcut" slot="suffix"><span class="char">⌘</span><span class="char">-</span></span></sl-menu-item>
            <sl-divider></sl-divider>
            <sl-menu-item value=".1">10%</sl-menu-item>
            <sl-menu-item value=".25">25%</sl-menu-item>
            <sl-menu-item value=".5">50%</sl-menu-item>
            <sl-menu-item value="1">100%</sl-menu-item>
            <sl-menu-item value="1.5">150%</sl-menu-item>
            <sl-menu-item value="2">200%</sl-menu-item>
            <sl-menu-item value="4">400%</sl-menu-item>
            <sl-divider></sl-divider>
            <sl-menu-item value="fit">Zoom to fit <span class="shortcut" slot="suffix"><span class="char">⌘</span><span class="char">0</span></span></sl-menu-item>
          </sl-menu>
        </sl-dropdown>
      </x-control-group>

      <x-control-group label="Reset">
        <sl-button size="small" variant="success" outline @click="${this._center}">Center (C)</sl-button>
        <sl-button size="small" variant="danger" outline @click="${this._reset}">Reset all</sl-button>
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
