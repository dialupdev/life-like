import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { LibraryStore } from "../stores/LibraryStore";
import "@spectrum-web-components/dialog/sp-dialog.js";
import "@spectrum-web-components/progress-circle/sp-progress-circle.js";

@customElement("x-pattern-library")
class PatternLibrary extends MobxLitElement {
  public static styles = css`
    :host {
      display: block;
    }

    sp-dialog {
      max-height: 80vh;
    }
  `;

  @property()
  public accessor libraryStore!: LibraryStore;

  private _loadPattern(e: Event): void {
    const path = (e.target! as HTMLElement).getAttribute("data-path");

    void this.libraryStore.loadPattern(path!);

    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  }

  protected render(): TemplateResult {
    return html`
      <sp-dialog>
        <h2 slot="heading">Pattern library</h2>
        ${when(
          this.libraryStore.patterns.length > 0,
          () =>
            html`<ul style="columns: 3; cursor: pointer;">
              ${this.libraryStore.patterns.map(
                pattern => html`<li @click=${this._loadPattern} data-path=${pattern.path}>${pattern.name}</li>`
              )}
            </ul>`,
          () => html`<sp-progress-circle label="Patterns loading..." indeterminate size="l"></sp-progress-circle>`
        )}
      </sp-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-pattern-library": PatternLibrary;
  }
}