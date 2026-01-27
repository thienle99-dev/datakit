
/**
 * Reads a File object and returns a Data URL string.
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Loads an image from a source (URL or Data URL) into an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Compresses an image file using Canvas toBlob with specified quality.
 * Returns a Blob.
 */
export async function compressImage(
  file: File, 
  quality: number = 0.8, 
  type: string = 'image/jpeg',
  maxWidth?: number,
  maxHeight?: number
): Promise<Blob> {
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);
  
  let width = img.width;
  let height = img.height;

  // Resize logic if max dimensions provided
  if (maxWidth || maxHeight) {
    const ratio = width / height;
    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      height = width / ratio;
    }
    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Compression failed'));
      },
      type,
      quality
    );
  });
}

/**
 * Rotates an image by degrees (90, 180, 270).
 */
export async function rotateImage(file: File, degrees: number): Promise<Blob> {
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Calculate new dimensions
  if (degrees % 180 !== 0) {
    canvas.width = img.height;
    canvas.height = img.width;
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
         if (blob) resolve(blob);
         else reject(new Error('Rotation failed'));
    }, file.type);
  });
}

/**
 * Converts image file to another format.
 */
export async function convertImageFormat(file: File, format: string): Promise<Blob> {
    // format should be mime type e.g., 'image/png'
    const dataUrl = await fileToDataURL(file);
    const img = await loadImage(dataUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if(!ctx) throw new Error("Canvas context missing");
    ctx.drawImage(img, 0, 0);
    
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if(blob) resolve(blob);
            else reject(new Error("Conversion failed"));
        }, format);
    });
}
