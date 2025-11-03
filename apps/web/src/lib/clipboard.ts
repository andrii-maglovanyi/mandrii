/**
 * Copies text to clipboard with fallback support for older browsers and iOS/Safari.
 *
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<void> {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.error("Clipboard API failed, falling back to legacy method:", err);
      // Fall through to legacy method
    }
  }

  // Legacy fallback for older browsers and iOS/Safari
  copyToClipboardLegacy(text);
}

/**
 * Legacy clipboard copy method using execCommand.
 * Works in older browsers and some iOS/Safari contexts where Clipboard API fails.
 *
 * @param text - The text to copy to clipboard
 */
function copyToClipboardLegacy(text: string): void {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Legacy clipboard copy failed:", err);
    throw new Error("Failed to copy to clipboard");
  } finally {
    document.body.removeChild(textArea);
  }
}
