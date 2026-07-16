import { MobxLitElement } from "@adobe/lit-mobx";
import { consume } from "@lit/context";
import { html, css, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { reaction, type IReactionDisposer } from "mobx";

import { type OverlayStore, OverlayMode, overlayStoreContext } from "../stores/OverlayStore.ts";
import { openOverlay } from "../utils/OverlayUtils.ts";

import type { TemplateResult } from "lit";

import "./x-import.ts";

interface OverlayCase {
  headline: string;
  template: () => TemplateResult;
}

type OverlayCaseEntry = [OverlayMode, OverlayCase];

@customElement("x-overlay-host")
class OverlayHost extends MobxLitElement {
  public static styles = css`
    :host {
      display: block;
      height: 0;
      overflow: hidden;
      position: fixed;
      width: 0;
    }
  `;

  @consume({ context: overlayStoreContext })
  private accessor _overlayStore!: OverlayStore;

  private _close: (() => void) | null = null;

  private _overlayModeDisposer?: IReactionDisposer;

  private get _overlayCases(): OverlayCaseEntry[] {
    return [[OverlayMode.import, { headline: OverlayMode.import, template: () => html`<x-import></x-import>` }]];
  }

  private _getOverlayCase(mode: OverlayMode): OverlayCase | undefined {
    return this._overlayCases.find(([overlayMode]) => overlayMode === mode)?.[1];
  }

  connectedCallback(): void {
    super.connectedCallback();

    this._overlayModeDisposer = reaction(
      () => this._overlayStore.overlayMode,
      (mode) => {
        if (mode) {
          void this._open(mode);
        } else {
          this._closeOverlay();
        }
      },
      { fireImmediately: true }
    );
  }

  disconnectedCallback(): void {
    this._overlayModeDisposer?.();
    this._closeOverlay();

    super.disconnectedCallback();
  }

  private _onOverlayClosed = (): void => {
    this._close = null;
    this._overlayStore.closeOverlay();
  };

  private _closeOverlay(): void {
    const close = this._close;

    this._close = null;

    close?.();
  }

  private async _open(mode: OverlayMode): Promise<void> {
    const overlayCase = this._getOverlayCase(mode);

    if (!overlayCase) {
      return;
    }

    this._closeOverlay();

    const dispose = await openOverlay(overlayCase.template(), overlayCase.headline, this, this._onOverlayClosed);

    if (this._overlayStore.overlayMode !== mode) {
      dispose();

      return;
    }

    this._close = () => {
      dispose();
      this._close = null;
    };
  }

  protected render(): typeof nothing {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-overlay-host": OverlayHost;
  }
}
