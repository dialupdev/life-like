import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Rule } from "../game/Rules";
import ConfigController from "../game/controllers/ConfigController";
import PositionController from "../game/controllers/PositionController";
import PlaybackController from "../game/controllers/PlaybackController";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js";
import "./x-control-group";

@customElement("x-sidebar")
class Sidebar extends MobxLitElement {
  static styles = css`
    :host {
      background: #f4f5f7;
      border-right: 2px solid #ddd;
      box-sizing: border-box;
      display: block;
      padding: 20px;
    }
  `;

  @property()
  public configController: ConfigController;

  @property()
  public positionController: PositionController;

  @property()
  public playbackController: PlaybackController;

  private _changeRule(e: Event): void {
    const rule = (e.target as HTMLSelectElement).value as Rule;
    this.configController.setRule(rule);
  }

  private _recenter(): void {
    this.positionController.recenterOffset();
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
    this.dispatchEvent(new Event("reset"));
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

      <x-control-group label="Position">
        <sl-button size="small" @click="${this._recenter}">Center (C)</sl-button>
      </x-control-group></x-control-group>

      <x-control-group label="Config">
        <sl-select size="small" label="Rule" value=${configModel.rule} @sl-change=${this._changeRule}>
          ${Object.entries(Rule).map(([ruleName, rule]) => {
            return html`<sl-menu-item value=${rule}>${ruleName}</sl-menu-item>`;
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
