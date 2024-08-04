import { MobxLitElement } from "@adobe/lit-mobx";
import { TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Picker } from "@spectrum-web-components/picker";
import { Rule } from "../core/Config";
import { Locator } from "../Locator";
import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/action-group/sp-action-group.js";
import "@spectrum-web-components/field-label/sp-field-label.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/picker/sp-picker.js";
import "./x-control-group";

@customElement("x-settings")
class Settings extends MobxLitElement {
  public static styles = css`
    :host {
      display: block;
    }
  `;

  @property()
  public accessor locator!: Locator;

  private _changeRule(e: Event): void {
    const rule = (e.target as Picker).value as Rule;
    this.locator.configStore.setRule(rule);
  }

  protected render(): TemplateResult {
    return html`
      <x-control-group label="Config" noDivider>
        <sp-field-label for="rule">Rule</sp-field-label>
        <sp-picker id="rule" value=${this.locator.configStore.rule} @change=${this._changeRule}>
          ${this.locator.configStore.getAllRules().map(([name, value]) => {
            return html`<sp-menu-item value=${value}>${name}</sp-menu-item>`;
          })}
        </sp-picker>
      </x-control-group>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-settings": Settings;
  }
}
