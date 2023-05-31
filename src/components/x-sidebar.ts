import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ConfigController } from "../game/controllers/ConfigController";
import { LayoutController } from "../game/controllers/LayoutController";
import { PlaybackController } from "../game/controllers/PlaybackController";
import { WorldController } from "../game/controllers/WorldController";
import { Rule } from "../game/Rules";
import "@shoelace-style/shoelace/dist/components/button-group/button-group.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/tooltip/tooltip.js";
import "./x-control-group";

@customElement("x-sidebar")
class Sidebar extends MobxLitElement {
  public static styles = css`
    :host {
      background: #f4f5f7;
      border-right: 2px solid #ddd;
      box-sizing: border-box;
      display: block;
      padding: 20px;
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
    const rule = (e.target as HTMLSelectElement).value as Rule;
    this.configController.setRule(rule);
  }

  private _recenter(): void {
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

  private _reset(): void {
    this.worldController.randomize();
    this.playbackController.pause();
    this.layoutController.reset();
  }

  protected render(): TemplateResult {
    const configModel = this.configController.model;
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

      <x-control-group label="Layout">
        <sl-button size="small" @click="${this._recenter}">Center (C)</sl-button>
      </x-control-group></x-control-group>

      <x-control-group label="Config">
        <sl-select size="small" label="Rule" value=${configModel.rule} @sl-change=${this._changeRule}>
          ${Object.entries(Rule).map(([ruleName, rule]) => {
            return html`<sl-option value=${rule}>${ruleName}</sl-option>`;
          })}
        </sl-select>
      </x-control-group>

      <x-control-group>
        <sl-button size="small" variant="danger" outline @click="${this._reset}">Reset</sl-button>
      </x-control-group>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-sidebar": Sidebar;
  }
}
