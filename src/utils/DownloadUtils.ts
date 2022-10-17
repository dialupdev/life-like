export function downloadImageFromBase64(base64Data: string, filename: string): void {
  const link = document.createElement("a");
  link.href = base64Data;
  link.download = filename;
  link.click();
}
