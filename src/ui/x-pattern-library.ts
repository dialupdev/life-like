import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { Locator } from "../Locator";
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
  public accessor locator!: Locator;

  private _loadPattern(e: CustomEvent): void {
    const path = (e.target! as HTMLElement).getAttribute("data-path")!;

    void this.locator.libraryStore.loadPattern(path);
  }

  protected render(): TemplateResult {
    const categories = this.locator.libraryStore.categories;

    return html`
      ${when(
        categories.length > 0,
        () =>
          html`<sp-accordion size="s">
            ${categories.map(
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
