import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import { ConfigController, Rule } from "../controllers/ConfigController";
import { GameController } from "../controllers/GameController";
import { LayoutController } from "../controllers/LayoutController";
import { WorldController } from "../controllers/WorldController";
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
      padding: 20px;

      display: block;
      font-family: var(--sl-font-sans);
      height: 100vh;

      position: absolute;
      top: 0;

      height: 100vh;
      left: 0;
      width: ${SIDEBAR_WIDTH}px;
    }
  `;

  @property()
  public worldController!: WorldController;

  @property()
  public configController!: ConfigController;

  @property()
  public layoutController!: LayoutController;

  @property()
  public gameController!: GameController;

  private _changeRule(e: Event): void {
    const rule = parseInt((e.target as HTMLSelectElement).value, 10) as Rule;
    this.configController.setRule(rule);
  }

  private _center(): void {
    this.layoutController.reset();
  }

  private _tick(): void {
    this.gameController.tick();
  }

  private _play(): void {
    this.gameController.play();
  }

  private _pause(): void {
    this.gameController.pause();
  }

  private _zoomToScale(e: CustomEvent): void {
    const scale = parseFloat(e.detail.item.value);

    this.layoutController.zoomToScale(scale);
  }

  private _resetAll(): void {
    this.worldController.randomize();
    this.gameController.pause();
    this.layoutController.reset();
  }

  protected render(): TemplateResult {
    return html`
      <x-control-group label="Playback">
        <sl-button size="small" variant="primary" outline @click="${this._tick}" ?disabled=${
      this.gameController.playing
    }
          >Tick (T)</sl-button
        >
        <sl-button size="small" variant="primary" outline @click="${
          this.gameController.playing ? this._pause : this._play
        }">
          ${this.gameController.playing ? "Pause" : "Play"} (P)
        </sl-button>
      </x-control-group>

      <x-control-group label="Zoom">
        <sl-dropdown stay-open-on-select>
          <sl-button slot="trigger" caret>${this.layoutController.zoomScale * 100}%</sl-button>
          <sl-menu @sl-select=${this._zoomToScale}>
            <sl-menu-item value=".1">10%</sl-menu-item>
            <sl-menu-item value=".25">25%</sl-menu-item>
            <sl-menu-item value=".5">50%</sl-menu-item>
            <sl-menu-item value="1">100%</sl-menu-item>
            <sl-menu-item value="1.5">150%</sl-menu-item>
            <sl-menu-item value="2">200%</sl-menu-item>
            <sl-menu-item value="4">400%</sl-menu-item>
          </sl-menu>
        </sl-dropdown>
      </x-control-group>

      <x-control-group label="Reset">
        <sl-button size="small" variant="success" outline @click="${this._center}">Center (C)</sl-button>
        <sl-button size="small" variant="danger" outline @click="${this._resetAll}">Reset all</sl-button>
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
