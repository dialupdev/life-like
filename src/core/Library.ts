import { World } from "./World";

export class Library {
  public loadPattern(_format: string, patternString: string, world: World): void {
    world.clear();

    patternString = patternString.replace(/\r/g, "");
    this._parseRle(patternString, world);
  }

  private _parseRle(patternString: string, world: World): void {
    // We compile these outside of the loop for better performance
    const commentRe = /^#/;
    const headerRe = /^x = (\d+), y = (\d+)/;

    let width = 0;
    let height = 0;

    let index = 0;
    let line: string;

    // Comments and header
    while ((line = patternString.substring(index, patternString.indexOf("\n", index) || undefined))) {
      // Add one to account for the newline char
      index += line.length + 1;

      // Comment
      if (line.match(commentRe)) {
        // eslint-disable-next-line
        console.log("comment", line);

        continue;
      }

      const headerMatch = line.match(headerRe);

      // Header
      if (headerMatch) {
        width = parseInt(headerMatch[1], 10);
        height = parseInt(headerMatch[2], 10);

        break;
      }
    }

    const originX = Math.floor(width / -2);
    let x = originX;
    let y = Math.floor(height / -2);

    let charCode: number;
    let count = 1;
    let numberInProgress = false;

    // Body
    for (; index < patternString.length; index++) {
      charCode = patternString.charCodeAt(index);

      if (charCode >= 48 && charCode <= 57) {
        // Numeric
        if (numberInProgress) {
          count *= 10;
          count += charCode ^ 48;
        } else {
          count = charCode ^ 48;
          numberInProgress = true;
        }
      } else {
        // Non-numeric
        if (charCode === 98) {
          // b
          x += count;
        } else if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode < 122)) {
          // A-Za-z
          while (count--) {
            world.addCell(x++, y);
          }
        } else if (charCode === 36) {
          // $
          y += count;
          x = originX;
        } else if (charCode === 33) {
          // !
          break;
        }

        count = 1;
        numberInProgress = false;
      }
    }
  }
}
