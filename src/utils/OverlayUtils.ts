import { Overlay } from "@spectrum-web-components/overlay";
import { html, render, type TemplateResult } from "lit";

import "@spectrum-web-components/dialog/sp-dialog-wrapper.js";

export function openOverlay(template: TemplateResult, headline: string, trigger: HTMLElement): Promise<() => void> {
  const wrappedTemplate = html`
    <sp-dialog-wrapper responsive no-divider dismissable underlay size="l" headline=${headline}>
      ${template}
    </sp-dialog-wrapper>
  `;

  const fragment = document.createDocumentFragment();

  render(wrappedTemplate, fragment);

  const overlayElement = fragment.children[0] as HTMLElement;

  return Overlay.open(trigger, "modal", overlayElement, {
    receivesFocus: "auto",
  });
}
