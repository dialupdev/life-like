import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { LibraryStore } from "../stores/LibraryStore";
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

  @property()
  public accessor libraryStore!: LibraryStore;

  private _loadPattern(e: Event): void {
    const path = (e.target! as HTMLElement).getAttribute("data-path");

    void this.libraryStore.loadPattern(path!);
  }

  protected render(): TemplateResult {
    return html`
      ${when(
        this.libraryStore.categories.length > 0,
        () =>
          html`<sp-accordion size="s">
            ${this.libraryStore.categories.map(
              category =>
                html`<sp-accordion-item label=${category.name}>
                  ${category.patterns.map(
                    pattern =>
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
