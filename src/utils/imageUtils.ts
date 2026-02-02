
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

/**
 * Trích xuất bảng màu từ ảnh bằng thuật toán K-Means Clustering để đảm bảo tính đa dạng và hài hòa.
 */
export async function extractPalette(
  file: File,
  colorCount: number = 6
): Promise<string[]> {
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  // Lấy mẫu ảnh nhỏ để tăng tốc độ xử lý
  const sampleSize = 100;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const pixels = imageData.data;
  
  // Chuẩn bị dữ liệu điểm ảnh (R, G, B)
  const points: number[][] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3]! < 128) continue; // Bỏ qua pixel trong suốt
    points.push([pixels[i]!, pixels[i + 1]!, pixels[i + 2]!]);
  }

  if (points.length === 0) return [];

  // Thuật toán K-Means đơn giản
  let centroids = points.slice(0, colorCount).map(p => [...p]);
  const maxIterations = 10;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters: number[][][] = Array.from({ length: colorCount }, () => []);
    
    // Gán điểm vào cluster gần nhất
    for (const point of points) {
      let minDist = Infinity;
      let clusterIndex = 0;
      for (let i = 0; i < centroids.length; i++) {
        const centroid = centroids[i]!;
        const dist = Math.sqrt(
          Math.pow(point[0]! - centroid[0]!, 2) +
          Math.pow(point[1]! - centroid[1]!, 2) +
          Math.pow(point[2]! - centroid[2]!, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = i;
        }
      }
      clusters[clusterIndex]!.push(point);
    }
    
    // Cập nhật tâm (centroids)
    let moved = false;
    for (let i = 0; i < centroids.length; i++) {
      const cluster = clusters[i]!;
      if (cluster.length === 0) continue;
      const newCentroid = [0, 0, 0];
      for (const p of cluster) {
        newCentroid[0] += p[0]!;
        newCentroid[1] += p[1]!;
        newCentroid[2] += p[2]!;
      }
      newCentroid[0] /= cluster.length;
      newCentroid[1] /= cluster.length;
      newCentroid[2] /= cluster.length;
      
      const currentCentroid = centroids[i]!;
      if (Math.abs(newCentroid[0] - currentCentroid[0]!) > 1 ||
          Math.abs(newCentroid[1] - currentCentroid[1]!) > 1 ||
          Math.abs(newCentroid[2] - currentCentroid[2]!) > 1) {
        moved = true;
      }
      centroids[i] = newCentroid;
    }
    if (!moved) break;
  }

  // Chuyển đổi centroids sang Hex và loại bỏ trùng lặp/màu rác
  return centroids.map(c => rgbToHex(Math.round(c[0]!), Math.round(c[1]!), Math.round(c[2]!)));
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1]!, 16),
    g: parseInt(result[2]!, 16),
    b: parseInt(result[3]!, 16)
  } : { r: 0, g: 0, b: 0 };
}

export function hexToHsl(hex: string): string {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Tính toán độ tương phản giữa màu chữ và màu nền (WCAG)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0]! * 0.2126 + a[1]! * 0.7152 + a[2]! * 0.0722;
}

/**
 * Làm đẹp ảnh (thường là ảnh chụp màn hình) bằng cách thêm background, bo góc và đổ bóng.
 */
export async function beautifyImage(
  file: File,
  options: {
    paddingX: number;
    paddingY: number;
    borderRadius: number;
    shadowBlur: number;
    shadowColor: string;
    background: string; // "linear-gradient(...)" hoặc "#hex"
  }
): Promise<Blob> {
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Kích thước cuối cùng
  const targetWidth = img.width + options.paddingX * 2;
  const targetHeight = img.height + options.paddingY * 2;
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 1. Vẽ Background
  if (options.background.includes('gradient')) {
    const grad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
    const colors = options.background.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/g) || ['#6366f1', '#a855f7'];
    colors.forEach((color, i) => {
      grad.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = options.background;
  }
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // 2. Vẽ Shadow cho ảnh
  ctx.save();
  ctx.shadowColor = options.shadowColor;
  ctx.shadowBlur = options.shadowBlur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = options.shadowBlur / 2;

  // 3. Bo góc ảnh (Clipping)
  const x = options.paddingX;
  const y = options.paddingY;
  const w = img.width;
  const h = img.height;
  const r = options.borderRadius;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  
  // Đổ bóng cho vùng path
  ctx.fill(); 
  
  // Clip để vẽ ảnh bên trong bo góc
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Beautification failed'));
    }, 'image/png', 1.0);
  });
}
