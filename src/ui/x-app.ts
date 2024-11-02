import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, nothing, css } from "lit";
import { customElement, state, queryAsync } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { SIDEBAR_WIDTH } from "../Constants";
import { Locator } from "../Locator";
import { PluginBuilder } from "../plugins/PluginBuilder";
import { PluginManager, PluginGroup } from "../plugins/PluginManager";
import "@spectrum-web-components/theme/scale-medium.js";
import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/theme-light.js";
import "./x-sidebar";

@customElement("x-app")
class App extends MobxLitElement {
  public static styles = css`
    * {
      box-sizing: border-box;
    }
    :host {
      display: block;
      height: 100vh;
      left: 0;
      position: absolute;
      top: 0;
      width: ${SIDEBAR_WIDTH * 2}px;
    }
    canvas {
      image-rendering: pixelated;
      left: ${SIDEBAR_WIDTH}px;
      position: absolute;
      top: 0;
    }
  `;

  @state()
  private accessor _locator!: Locator;

  @queryAsync("canvas")
  private accessor _canvasPromise!: Promise<HTMLCanvasElement>;

  constructor() {
    super();

    this._canvasPromise.then(canvas => {
      this._locator = new Locator(canvas);

      const pluginBuilder = new PluginBuilder(canvas);
      const pluginManager = new PluginManager(
        pluginBuilder,
        this._locator.drawerStore,
        this._locator.layoutStore,
        this._locator.playbackStore,
        this._locator.appStore
      );

      pluginManager.activateGroup(PluginGroup.default);
      pluginManager.activateGroup(PluginGroup.playback);

      this._locator.libraryStore.loadPatterns();
    });
  }

  protected render(): TemplateResult | typeof nothing {
    return html`
      <sp-theme system="spectrum" color="light" scale="medium">
        <canvas></canvas>

        ${when(this._locator, () => html`<x-sidebar .locator=${this._locator}></x-sidebar>`)}
      </sp-theme>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
