
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

/**
 * Preset aspect ratios for image upscaling
 */
export const ASPECT_RATIO_PRESETS = {
  '1:1': { width: 1, height: 1, label: 'Square (1:1)' },
  '16:9': { width: 16, height: 9, label: 'Landscape (16:9)' },
  '9:16': { width: 9, height: 16, label: 'Portrait (9:16)' },
  '4:3': { width: 4, height: 3, label: 'Classic (4:3)' },
  '21:9': { width: 21, height: 9, label: 'Ultrawide (21:9)' },
} as const;

/**
 * Upscale image với các phương pháp interpolation khác nhau
 */
export async function upscaleImage(
  file: File,
  scaleFactor: number = 2,
  method: 'bicubic' | 'lanczos' | 'nearest' | 'bilinear' = 'bicubic',
  targetAspectRatio?: { width: number; height: number }
): Promise<Blob> {
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);
  
  let targetWidth = Math.round(img.width * scaleFactor);
  let targetHeight = Math.round(img.height * scaleFactor);
  
  // Apply aspect ratio nếu có
  if (targetAspectRatio && targetAspectRatio.width > 0 && targetAspectRatio.height > 0) {
    const targetRatio = targetAspectRatio.width / targetAspectRatio.height;
    const currentRatio = targetWidth / targetHeight;
    
    if (currentRatio > targetRatio) {
      targetHeight = Math.round(targetWidth / targetRatio);
    } else {
      targetWidth = Math.round(targetHeight * targetRatio);
    }
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext('2d', {
    imageSmoothingEnabled: method !== 'nearest',
    imageSmoothingQuality: method === 'lanczos' ? 'high' : 
                          method === 'bicubic' ? 'high' : 'medium'
  }) as CanvasRenderingContext2D | null;
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Draw với interpolation
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Upscaling failed'));
    }, file.type, 1.0); // Maximum quality
  });
}
