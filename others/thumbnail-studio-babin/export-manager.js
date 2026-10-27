/**
 * Thumbnail Export Manager
 * Handles WebP/PNG downloads and direct clipboard blob copy.
 * Author: Babin Bid (@Babin123456)
 */

class ThumbnailExportManager {
  static downloadImage(canvas, format = "webp", filename = "arcadeverse_promo") {
    const mime = format === "png" ? "image/png" : "image/webp";
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }, mime, 0.92);
  }

  static async copyToClipboard(canvas) {
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error("Clipboard API not supported in this browser");
    }
    return new Promise((resolve, reject) => {
      canvas.toBlob(async blob => {
        if (!blob) {
          reject(new Error("Failed to create blob from canvas"));
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          resolve();
        } catch (err) {
          reject(err);
        }
      }, "image/png");
    });
  }
}

window.ThumbnailExportManager = ThumbnailExportManager;
