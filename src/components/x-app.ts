import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, queryAsync } from "lit/decorators.js";
import { SIDEBAR_WIDTH } from "../Constants";
import WorldModel from "../game/models/WorldModel";
import ConfigModel from "../game/models/ConfigModel";
import PositionModel from "../game/models/PositionModel";
import PlaybackModel from "../game/models/PlaybackModel";
import EditModel from "../game/models/EditModel";
import LifecycleSystem from "../game/systems/LifecycleSystem";
import RenderSystem from "../game/systems/RenderSystem";
import WorldController from "../game/controllers/WorldController";
import ConfigController from "../game/controllers/ConfigController";
import PositionController from "../game/controllers/PositionController";
import PlaybackController from "../game/controllers/PlaybackController";
import PluginBuilder from "../game/plugins/PluginBuilder";
import PluginManager, { PluginGroup } from "../game/plugins/PluginManager";
import EditController from "../game/controllers/EditController";
import "@shoelace-style/shoelace/dist/themes/light.css";
import "./x-sidebar";

@customElement("x-app")
class App extends MobxLitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--sl-font-sans);
      height: 100vh;
    }
    x-sidebar,
    canvas {
      position: absolute;
      top: 0;
    }
    x-sidebar {
      height: 100vh;
      left: 0;
      width: ${SIDEBAR_WIDTH}px;
    }
    canvas {
      image-rendering: pixelated;
      left: ${SIDEBAR_WIDTH}px;
    }
    canvas.tool-pencil {
      cursor: url("/images/pencil.svg"), auto;
    }
    canvas.tool-eraser {
      cursor: url("/images/eraser.svg"), auto;
    }
  `;

  // Models
  private _worldModel = new WorldModel();
  private _configModel = new ConfigModel();
  private _positionModel = new PositionModel();
  private _playbackModel = new PlaybackModel();
  private _editModel = new EditModel();

  // Systems
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;

  // Controllers
  private _worldController: WorldController;
  private _configController: ConfigController;
  private _positionController: PositionController;
  private _playbackController: PlaybackController;
  private _editController: EditController;

  // Plugins
  private _pluginBuilder: PluginBuilder;
  private _pluginManager: PluginManager;

  @queryAsync("canvas")
  private _canvasPromise!: Promise<HTMLCanvasElement>;

  constructor() {
    super();

    this._lifecycleSystem = new LifecycleSystem(this._worldModel, this._configModel);
    this._renderSystem = new RenderSystem(
      this._worldModel,
      this._positionModel,
      this._playbackModel,
      this._canvasPromise
    );

    this._worldController = new WorldController(this._worldModel);
    this._configController = new ConfigController(this._configModel);
    this._positionController = new PositionController(this._positionModel, this._renderSystem, this._canvasPromise);
    this._playbackController = new PlaybackController(this._playbackModel, this._lifecycleSystem, this._renderSystem);
    this._editController = new EditController(
      this._worldModel,
      this._positionModel,
      this._editModel,
      this._renderSystem
    );

    this._pluginBuilder = new PluginBuilder(this._canvasPromise);
    this._pluginManager = new PluginManager(
      this._pluginBuilder,
      this._positionController,
      this._playbackController,
      this._editController
    );

    this._pluginManager.activateGroup(PluginGroup.Default);
    this._pluginManager.activateGroup(PluginGroup.Playback);

    this._editController.addEventListener("start", () => {
      this._pluginManager.deactivateGroup(PluginGroup.Playback);
      this._pluginManager.activateGroup(PluginGroup.Edit);
    });

    this._editController.addEventListener("stop", () => {
      this._pluginManager.deactivateGroup(PluginGroup.Edit);
      this._pluginManager.activateGroup(PluginGroup.Playback);
    });
  }

  protected render(): TemplateResult {
    return html`
      <x-sidebar
        .worldController=${this._worldController}
        .configController=${this._configController}
        .positionController=${this._positionController}
        .playbackController=${this._playbackController}
        .editController=${this._editController}
      ></x-sidebar>
      <canvas class=${this._editModel.editing && `tool-${this._editModel.activeTool.toLowerCase()}`}></canvas>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-app": App;
  }
}
