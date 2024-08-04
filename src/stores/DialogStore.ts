import { Overlay } from "@spectrum-web-components/overlay";
import { render, html, TemplateResult } from "lit";
import { makeObservable, observable, runInAction } from "mobx";
import "@spectrum-web-components/dialog/sp-dialog-wrapper.js";

export class DialogStore {
  public activeDialog: Maybe<Overlay> = undefined;

  constructor() {
    makeObservable(this, {
      activeDialog: observable,
    });
  }

  public async openDialog(headline: string, template: TemplateResult): Promise<void> {
    const renderedTemplate = html`
      <sp-dialog-wrapper responsive underlay dismissable headline=${headline}>
        <div>${template}</div>
      </sp-dialog-wrapper>
    `;

    const fragment = document.createDocumentFragment();
    render(renderedTemplate, fragment);

    const dialogElement = fragment.children[0] as HTMLElement;
    const dialog = await Overlay.open(dialogElement, { type: "modal" });

    runInAction(() => {
      this.activeDialog = dialog;
    });
  }
}
