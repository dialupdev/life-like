import { LitElement, TemplateResult, html, css } from "lit";
import { customElement } from "lit/decorators.js";

export class TickEvent extends Event {
  constructor() {
    super("tick");
  }
}

@customElement("x-world-controls")
class WorldControls extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .buttons {
      margin: 10px 0;
    }
  `;

  private _handleTick(): void {
    this.dispatchEvent(new TickEvent());
  }

  protected render(): TemplateResult {
    return html`
      <div class="buttons">
        <button @click="${this._handleTick}">Tick</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-world-controls": WorldControls;
  }
}
