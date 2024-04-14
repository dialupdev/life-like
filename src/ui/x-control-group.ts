import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import "@spectrum-web-components/divider/sp-divider.js";

@customElement("x-control-group")
class ControlGroup extends LitElement {
  public static styles = css`
    * {
      box-sizing: border-box;
    }
    :host {
      display: block;
      margin: 10px 0;
    }
    sp-divider {
      margin: 1em 0;
    }
  `;

  @property()
  public accessor label!: string;

  protected render(): TemplateResult {
    return html`
      ${when(this.label, () => html`<p>${this.label}</p>`)}
      <slot></slot>
      <sp-divider size="s"></sp-divider>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-control-group": ControlGroup;
  }
}
