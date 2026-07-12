import { consume } from "@lit/context";
import { LitElement, html, css } from "lit";
import { customElement, query } from "lit/decorators.js";

import { type World, worldContext } from "../core/World.ts";
import { type PatternStore, patternStoreContext } from "../stores/PatternStore.ts";

import type { TemplateResult } from "lit";

import "@spectrum-web-components/dropzone/sp-dropzone.js";

@customElement("x-import")
class Import extends LitElement {
  public static styles = css`
    * {
      box-sizing: border-box;
    }
    :host {
      display: block;
    }
    sp-dropzone {
      cursor: pointer;
      width: 100%;
    }
  `;

  @consume({ context: worldContext })
  private accessor _world!: World;

  @consume({ context: patternStoreContext })
  private accessor _patternStore!: PatternStore;

  @query("input[type='file']")
  private accessor _input!: HTMLInputElement;

  private _openFilePicker = (): void => {
    this._input.click();
  };

  private _onDropzoneKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this._openFilePicker();
    }
  };

  private async _importFile(file: File): Promise<void> {
    const patternString = await file.text();

    void this._patternStore.importFromString(patternString);

    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  }

  private _onFileInputChange = async (event: Event): Promise<void> => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      await this._importFile(file);
      input.value = "";
    }
  };

  private _onDropzoneDrop = async (event: Event): Promise<void> => {
    const file = (event as CustomEvent<DragEvent>).detail.dataTransfer?.files[0];

    if (file) {
      await this._importFile(file);
    }
  };

  protected render(): TemplateResult {
    return html`
      <sp-dropzone
        tabindex="0"
        @click=${this._openFilePicker}
        @keydown=${this._onDropzoneKeydown}
        @sp-dropzone-drop=${this._onDropzoneDrop}
      >
        <p>Drop pattern file or click to select</p>
        <input type="file" accept=".rle,.lif" hidden @change=${this._onFileInputChange} />
      </sp-dropzone>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-import": Import;
  }
}
