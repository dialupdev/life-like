import { MobxLitElement } from "@adobe/lit-mobx";
import { consume } from "@lit/context";
import { html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { when } from "lit/directives/when.js";

import { type Playback, playbackContext } from "../core/Playback.ts";
import { type LibraryStore, libraryStoreContext } from "../stores/LibraryStore.ts";

import type { TemplateResult } from "lit";

import "@spectrum-web-components/accordion/sp-accordion.js";
import "@spectrum-web-components/accordion/sp-accordion-item.js";
import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/progress-bar/sp-progress-bar.js";

@customElement("x-pattern-library")
class PatternLibrary extends MobxLitElement {
  public static styles = css`
    * {
      box-sizing: border-box;
    }
    :host {
      display: block;
    }
    sp-action-button {
      display: block;
    }
  `;

  @consume({ context: playbackContext })
  private accessor _playback!: Playback;

  @consume({ context: libraryStoreContext })
  private accessor _libraryStore!: LibraryStore;

  private _loadPattern(e: CustomEvent): void {
    const path = (e.target! as HTMLElement).getAttribute("data-path")!;

    this._playback.pause();

    void this._libraryStore.loadPattern(path);
  }

  connectedCallback(): void {
    super.connectedCallback();

    void this._libraryStore.loadPatterns();
  }

  protected render(): TemplateResult {
    const categories = this._libraryStore.categories;

    return html`
      ${when(
        categories.length > 0,
        () =>
          html`<sp-accordion size="s">
            ${categories.map(
              (category) =>
                html`<sp-accordion-item label=${category.name}>
                  ${category.patterns.map(
                    (pattern) =>
                      html`<sp-action-button quiet size="s" @click=${this._loadPattern} data-path=${pattern.path}
                        >${pattern.name}</sp-action-button
                      >`
                  )}
                </sp-accordion-item>`
            )}
          </sp-accordion>`,
        () => html`<sp-progress-bar label="Patterns loading..." indeterminate></sp-progress-bar>`
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-pattern-library": PatternLibrary;
  }
}
