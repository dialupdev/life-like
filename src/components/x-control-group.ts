import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import "@shoelace-style/shoelace/dist/components/divider/divider.js";

@customElement("x-control-group")
class ControlGroup extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin: 10px 0;
    }
    .label {
      font-size: var(--sl-font-size-x-small);
    }
  `;

  @property()
  public label!: string;

  protected render(): TemplateResult {
    return html`
      ${when(this.label, () => html`<p class="label">${this.label}</p>`)}
      <slot></slot>
      <sl-divider></sl-divider>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-control-group": ControlGroup;
  }
}
