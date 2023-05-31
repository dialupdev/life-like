import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import { ConfigController, Rule } from "../game/controllers/ConfigController";
import { LayoutController } from "../game/controllers/LayoutController";
import { PlaybackController } from "../game/controllers/PlaybackController";
import { WorldController } from "../game/controllers/WorldController";
import "@shoelace-style/shoelace/dist/themes/light.css";
import "@shoelace-style/shoelace/dist/components/button-group/button-group.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
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
  public playbackController!: PlaybackController;

  private _changeRule(e: Event): void {
    const rule = parseInt((e.target as HTMLSelectElement).value, 10) as Rule;
    this.configController.setRule(rule);
  }

  private _center(): void {
    this.layoutController.reset();
  }

  private _tick(): void {
    this.playbackController.tick();
  }

  private _play(): void {
    this.playbackController.play();
  }

  private _pause(): void {
    this.playbackController.pause();
  }

  private _resetAll(): void {
    this.worldController.randomize();
    this.playbackController.pause();
    this.layoutController.reset();
  }

  protected render(): TemplateResult {
    const playbackModel = this.playbackController.model;

    return html`
      <x-control-group label="Playback">
        <sl-button size="small" variant="primary" outline @click="${this._tick}" ?disabled=${playbackModel.playing}
          >Tick (T)</sl-button
        >
        <sl-button size="small" variant="primary" outline @click="${playbackModel.playing ? this._pause : this._play}">
          ${playbackModel.playing ? "Pause" : "Play"} (P)
        </sl-button>
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
