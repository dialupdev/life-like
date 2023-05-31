import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import { ConfigController } from "../game/controllers/ConfigController";
import { LayoutController } from "../game/controllers/LayoutController";
import { PlaybackController } from "../game/controllers/PlaybackController";
import { WorldController } from "../game/controllers/WorldController";

import "@shoelace-style/shoelace/dist/themes/light.css";
import "./x-sidebar";

@customElement("x-app")
class App extends MobxLitElement {
  public static styles = css`
    :host {
      display: block;
      font-family: var(--sl-font-sans);
      height: 100vh;
    }
    x-sidebar {
      position: absolute;
      top: 0;
    }
    x-sidebar {
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

  constructor() {
    super();
  }

  protected render(): TemplateResult {
    return html`<x-sidebar
      .worldController=${this.worldController}
      .configController=${this.configController}
      .layoutController=${this.layoutController}
      .playbackController=${this.playbackController}
    ></x-sidebar> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
