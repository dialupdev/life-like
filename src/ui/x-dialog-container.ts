import { MobxLitElement } from "@adobe/lit-mobx";
import { reaction } from "mobx";
import { TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { Locator } from "../Locator";

@customElement("x-dialog-container")
class DialogContainer extends MobxLitElement {
  private _triggerRef: Ref<HTMLElement> = createRef();

  @property()
  public accessor locator!: Locator;

  constructor() {
    super();
    this._maybeRenderDialog = this._maybeRenderDialog.bind(this);

    reaction(() => this.locator.dialogStore.activeDialog, this._maybeRenderDialog);
  }

  private _maybeRenderDialog() {
    if (!this.locator.dialogStore.activeDialog) {
      return;
    }

    this._triggerRef.value!.insertAdjacentElement("afterend", this.locator.dialogStore.activeDialog);
  }

  render(): TemplateResult {
    return html`<span ${ref(this._triggerRef)}></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-dialog-container": DialogContainer;
  }
}
