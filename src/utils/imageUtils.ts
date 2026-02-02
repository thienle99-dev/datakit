
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
  targetAspectRatio?: { width: number; height: number },
  cropPosition: { x: number; y: number } = { x: 50, y: 50 },
  cropSize: number = 100,
  sharpenAmount: number = 0
): Promise<Blob> {
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);
  
  // Calculate Source Rectangle
  let sourceWidth = img.width;
  let sourceHeight = img.height;
  const imgRatio = img.width / img.height;

  if (targetAspectRatio && targetAspectRatio.width > 0 && targetAspectRatio.height > 0) {
    const targetRatio = targetAspectRatio.width / targetAspectRatio.height;
    if (imgRatio > targetRatio) {
      sourceWidth = img.height * targetRatio;
    } else {
      sourceHeight = img.width / targetRatio;
    }
  }

  // Apply cropSize (zoom)
  sourceWidth = (sourceWidth * cropSize) / 100;
  sourceHeight = (sourceHeight * cropSize) / 100;

  // Calculate Source Offsets based on cropPosition (center focal point)
  const centerX = img.width * (cropPosition.x / 100);
  const centerY = img.height * (cropPosition.y / 100);
  
  let sourceX = centerX - sourceWidth / 2;
  let sourceY = centerY - sourceHeight / 2;

  // Clamping within image bounds
  sourceX = Math.max(0, Math.min(img.width - sourceWidth, sourceX));
  sourceY = Math.max(0, Math.min(img.height - sourceHeight, sourceY));

  // Target dimensions
  const targetWidth = Math.round(sourceWidth * scaleFactor);
  const targetHeight = Math.round(sourceHeight * scaleFactor);
  
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Set smoothing properties
  ctx.imageSmoothingEnabled = method !== 'nearest';
  if (ctx.imageSmoothingEnabled) {
    ctx.imageSmoothingQuality = method === 'lanczos' ? 'high' : 
                               method === 'bicubic' ? 'high' : 'medium';
  }
  
  ctx.drawImage(
    img, 
    sourceX, sourceY, sourceWidth, sourceHeight, // Source
    0, 0, targetWidth, targetHeight            // Destination
  );

  // Apply Smart Sharpen if amount > 0
  if (sharpenAmount > 0) {
    applySharpen(ctx, targetWidth, targetHeight, sharpenAmount);
  }
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Upscaling failed'));
    }, file.type, 1.0); // Maximum quality
  });
}

function applySharpen(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const originalPixels = new Uint8ClampedArray(pixels);
  
  // Convolution matrix for sharpening (Unsharp Mask style)
  // [  0, -1,  0 ]
  // [ -1,  5, -1 ]
  // [  0, -1,  0 ]
  // We blend this with the original based on 'amount'
  
  const factor = amount / 100;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      for (let c = 0; c < 3; c++) { // R, G, B
        const idxC = idx + c;
        const current = originalPixels[idxC] ?? 0;
        const top = originalPixels[idxC - width * 4] ?? 0;
        const bottom = originalPixels[idxC + width * 4] ?? 0;
        const left = originalPixels[idxC - 4] ?? 0;
        const right = originalPixels[idxC + 4] ?? 0;
        
        // Basic sharpen formula: 5*current - (top+bottom+left+right)
        const sharpened = 5 * current - (top + bottom + left + right);
        
        // Blend original with sharpened result
        pixels[idxC] = current + (sharpened - current) * factor;
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}
/**
 * Renders table data (headers and rows) to a Blob representing an image.
 */
export function dataToImage(headers: string[], data: any[]): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const cellWidth = 150;
  const cellHeight = 30;
  const padding = 20;
  const maxRows = 50; // Limit rendering for performance
  const displayData = data.slice(0, maxRows);

  canvas.width = headers.length * cellWidth + padding * 2;
  canvas.height = (displayData.length + 1) * cellHeight + padding * 2;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 14px sans-serif';
  ctx.textBaseline = 'middle';

  // Draw Headers
  headers.forEach((header, i) => {
    const x = padding + i * cellWidth;
    const y = padding;
    
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.strokeStyle = '#e5e7eb';
    ctx.strokeRect(x, y, cellWidth, cellHeight);
    
    ctx.fillStyle = '#374151';
    ctx.fillText(header.toString().substring(0, 20), x + 10, y + cellHeight / 2);
  });

  // Draw Data
  ctx.font = '12px sans-serif';
  displayData.forEach((row, rowIndex) => {
    headers.forEach((header, colIndex) => {
      const x = padding + colIndex * cellWidth;
      const y = padding + (rowIndex + 1) * cellHeight;
      
      ctx.strokeStyle = '#e5e7eb';
      ctx.strokeRect(x, y, cellWidth, cellHeight);
      
      ctx.fillStyle = '#4b5563';
      const value = row[header] !== undefined ? row[header] : '';
      ctx.fillText(value.toString().substring(0, 25), x + 10, y + cellHeight / 2);
    });
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to convert data to image'));
    }, 'image/png');
  });
}
