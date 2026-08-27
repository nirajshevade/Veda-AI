/**
 * Reads a single image file as a base64 data URL.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to dynamically load pdfjs on the client side only to avoid SSR DOMMatrix issues.
 */
async function getPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only supported in the browser.');
  }
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  return pdfjs;
}

/**
 * Returns the total number of pages in a given PDF file.
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error("Error reading PDF page count:", error);
    return 1;
  }
}

/**
 * Converts all pages of a PDF file into an array of base64 JPEG image data URLs.
 */
export async function convertPdfToImages(file: File): Promise<string[]> {
  try {
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      } as any).promise;

      images.push(canvas.toDataURL('image/jpeg', 0.85));
    }

    return images;
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw error;
  }
}

/**
 * Converts any supported file (PDF or Image) into an array of base64 image strings.
 */
export async function convertFileToPageImages(file: File): Promise<string[]> {
  if (file.type === 'application/pdf') {
    return await convertPdfToImages(file);
  } else {
    const dataUrl = await fileToDataUrl(file);
    return [dataUrl];
  }
}
