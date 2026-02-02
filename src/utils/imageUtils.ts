
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

export function hexToHsl(hex: string): string {
  const { h, s, l } = getHslData(hex);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function getHslData(hex: string): { h: number; s: number; l: number } {
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
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.max(0, n)));
  const componentToHex = (c: number) => {
    const hex = Math.round(clamp(c)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1]!, 16),
    g: parseInt(result[2]!, 16),
    b: parseInt(result[3]!, 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Trích xuất bảng màu từ ảnh bằng thuật toán K-Means Clustering.
 * Hỗ trợ các phong cách màu khác nhau: vibrant, muted, light, dark.
 */
export async function extractPalette(
  file: File,
  colorCount: number = 6,
  style: 'all' | 'vibrant' | 'muted' | 'light' | 'dark' = 'all'
): Promise<string[]> {
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  const sampleSize = 100;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  
  if (img) {
    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
  }

  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const pixels = imageData.data;
  
  const points: number[][] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i+1];
    const b = pixels[i+2];
    const a = pixels[i+3];
    
    if (r === undefined || g === undefined || b === undefined || a === undefined) continue;
    if (a < 128) continue;

    if (style !== 'all') {
      const hex = rgbToHex(r, g, b);
      const { s, l } = getHslData(hex);
      if (style === 'vibrant' && s < 40) continue;
      if (style === 'muted' && s > 40) continue;
      if (style === 'light' && l < 60) continue;
      if (style === 'dark' && l > 40) continue;
    }
    
    points.push([r, g, b]);
  }

  if (points.length < colorCount) {
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i+1];
      const b = pixels[i+2];
      const a = pixels[i+3];
      if (r !== undefined && g !== undefined && b !== undefined && a !== undefined && a >= 128) {
        points.push([r, g, b]);
      }
      if (points.length >= 100) break;
    }
  }

  if (points.length === 0) return [];

  const centroids: number[][] = points.slice(0, colorCount).map(p => [...(p || [0,0,0])]);
  const maxIterations = 15;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters: number[][][] = Array.from({ length: centroids.length }, () => []);
    
    for (const point of points) {
      let minDist = Infinity;
      let clusterIndex = 0;
      for (let i = 0; i < centroids.length; i++) {
        const centroid = centroids[i];
        if (!centroid) continue;
        const p0 = point[0] ?? 0;
        const p1 = point[1] ?? 0;
        const p2 = point[2] ?? 0;
        const c0 = centroid[0] ?? 0;
        const c1 = centroid[1] ?? 0;
        const c2 = centroid[2] ?? 0;
        const dist = Math.pow(p0 - c0, 2) + Math.pow(p1 - c1, 2) + Math.pow(p2 - c2, 2);
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = i;
        }
      }
      clusters[clusterIndex]?.push(point);
    }
    
    let moved = false;
    for (let i = 0; i < centroids.length; i++) {
      const cluster = clusters[i];
      if (!cluster || cluster.length === 0) continue;
      const newCentroid = [0, 0, 0];
      for (const p of cluster) {
        newCentroid[0] += p[0] || 0;
        newCentroid[1] += p[1] || 0;
        newCentroid[2] += p[2] || 0;
      }
      newCentroid[0] /= cluster.length;
      newCentroid[1] /= cluster.length;
      newCentroid[2] /= cluster.length;
      
      const currentCentroid = centroids[i];
      if (currentCentroid && Math.abs(newCentroid[0] - (currentCentroid[0] ?? 0)) > 0.5) {
        moved = true;
      }
      centroids[i] = newCentroid;
    }
    if (!moved) break;
  }

  return centroids.map(c => rgbToHex(Math.round(c[0] ?? 0), Math.round(c[1] ?? 0), Math.round(c[2] ?? 0)));
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
 * Lấy các màu hài hòa (Harmony) dựa trên màu gốc.
 */
export function getHarmoniousColors(hex: string): { type: string; colors: string[] }[] {
  const { h, s, l } = getHslData(hex);
  
  const toHex = (hue: number) => {
    const nh = (hue + 360) % 360;
    return hslToHex(nh, s, l);
  };

  return [
    { type: 'Complementary', colors: [toHex(h + 180)] },
    { type: 'Analogous', colors: [toHex(h - 30), toHex(h + 30)] },
    { type: 'Triadic', colors: [toHex(h + 120), toHex(h + 240)] },
    { type: 'Split Complementary', colors: [toHex(h + 150), toHex(h + 210)] }
  ];
}

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Tạo một tấm ảnh Poster nghệ thuật bao gồm ảnh gốc và bảng màu.
 */
export async function generatePalettePoster(
  file: File,
  palette: string[]
): Promise<Blob> {
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Kích thước Portrait (4:5) cho Social Media
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  // 1. Vẽ Background trắng tinh khôi
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Vẽ Ảnh gốc (Cropped/Centered)
  const imgAreaHeight = height * 0.7;
  const imgRatio = img.width / img.height;
  const areaRatio = width / imgAreaHeight;
  
  let drawW, drawH, drawX, drawY;
  if (imgRatio > areaRatio) {
    drawH = imgAreaHeight;
    drawW = imgAreaHeight * imgRatio;
    drawX = (width - drawW) / 2;
    drawY = 0;
  } else {
    drawW = width;
    drawH = width / imgRatio;
    drawX = 0;
    drawY = (imgAreaHeight - drawH) / 2;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, imgAreaHeight);
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 3. Vẽ Bảng màu bên dưới
  const padding = 60;
  const swatchAreaY = imgAreaHeight + padding;
  const swatchSize = (width - padding * 2 - (palette.length - 1) * 20) / palette.length;

  palette.forEach((color, i) => {
    const x = padding + i * (swatchSize + 20);
    const y = swatchAreaY;

    // Vẽ Color Swatch
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, swatchSize, swatchSize * 1.5, 20);
    ctx.fill();

    // Vẽ Hex Code (Dọc)
    ctx.save();
    ctx.translate(x + swatchSize / 2, y + swatchSize * 1.5 - 15);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = getContrastRatio(color, '#ffffff') > 4.5 ? '#ffffff' : '#000000';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(color.toUpperCase(), 0, 8);
    ctx.restore();
  });

  // 4. Thêm Text trang trí
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('COLOR PALETTE', padding, swatchAreaY + swatchSize * 1.5 + 80);
  
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 20px Inter, sans-serif';
  ctx.fillText('Generated by DataKit Image Studio', padding, swatchAreaY + swatchSize * 1.5 + 115);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Poster generation failed'));
    }, 'image/png', 1.0);
  });
}

/**
 * Core drawing logic for beautifying images.
 */
export function drawBeautifiedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  options: {
    paddingX: number;
    paddingY: number;
    borderRadius: number;
    shadowBlur: number;
    shadowColor: string;
    background: string;
    inset: number;
    rotation: number;
    scale: number;
    browserFrame: 'none' | 'safari' | 'chrome' | 'windows' | 'arc';
    noise: boolean;
  }
) {
  const targetWidth = ctx.canvas.width;
  const targetHeight = ctx.canvas.height;

  // 1. Draw Background
  if (options.background.startsWith('mesh:')) {
    const colors = options.background.replace('mesh:', '').split(',').map(c => c.trim());
    ctx.fillStyle = colors[0] || '#000';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Add multiple radial "blobs" for mesh effect
    const spots = [
      { x: 0, y: 0, r: targetWidth * 1.2 },
      { x: targetWidth, y: 0, r: targetWidth * 1.2 },
      { x: 0, y: targetHeight, r: targetWidth * 1.2 },
      { x: targetWidth, y: targetHeight, r: targetWidth * 1.2 },
      { x: targetWidth / 2, y: targetHeight / 2, r: targetWidth }
    ];

    spots.forEach((s, i) => {
      const color = colors[i % colors.length] || colors[0]!;
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.restore();
    });
  } else if (options.background.includes('gradient')) {
    const grad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
    const colors = options.background.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgba?\([^)]+\)/g) || ['#6366f1', '#a855f7'];
    colors.forEach((color, i) => {
      grad.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Add Noise texture if enabled
  if (options.noise) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 1000; i++) {
       ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
       ctx.fillRect(Math.random() * targetWidth, Math.random() * targetHeight, 1, 1);
    }
    ctx.restore();
  }

  // 2. Transformations
  ctx.save();
  ctx.translate(targetWidth / 2, targetHeight / 2);
  ctx.rotate((options.rotation * Math.PI) / 180);
  ctx.scale(options.scale, options.scale);
  
  const insetFactor = (100 - options.inset) / 100;
  const drawW = img.width * insetFactor;
  const drawH = img.height * insetFactor;
  const drawX = -drawW / 2;
  const drawY = -drawH / 2;
  const r = options.borderRadius;

  // 3. Draw Shadow
  ctx.shadowColor = options.shadowColor;
  ctx.shadowBlur = options.shadowBlur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = options.shadowBlur / 2;

  // 4. Draw Browser Frame
  const frameHeight = options.browserFrame !== 'none' ? 32 : 0;
  ctx.beginPath();
  ctx.roundRect(drawX, drawY - frameHeight, drawW, drawH + frameHeight, r);
  ctx.fill(); 

  if (options.browserFrame !== 'none') {
    ctx.save();
    ctx.clip();
    
    // Header Background
    if (options.browserFrame === 'safari') {
      ctx.fillStyle = '#f1f1f1';
    } else if (options.browserFrame === 'chrome') {
      ctx.fillStyle = '#ebedef';
    } else if (options.browserFrame === 'arc') {
      ctx.fillStyle = '#1c1c1e';
    } else if (options.browserFrame === 'windows') {
      ctx.fillStyle = '#ffffff';
    } else if (options.browserFrame === 'mobile' || options.browserFrame === 'tablet') {
      ctx.fillStyle = '#000000';
    } else if (options.browserFrame === 'desktop') {
      ctx.fillStyle = '#222222';
    }
    
    // Draw Header area for Browsers
    const isBrowser = ['safari', 'chrome', 'arc', 'windows'].includes(options.browserFrame);
    if (isBrowser) {
      ctx.fillRect(drawX, drawY - frameHeight, drawW, frameHeight);
    }
    
    // Traffic lights / Control buttons
    if (options.browserFrame === 'windows') {
      // Windows 11 style controls (Right side)
      const btnW = 46;
      const centerY = drawY - frameHeight / 2;
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      
      // Close (X)
      const xRight = drawX + drawW - 23;
      ctx.beginPath();
      ctx.moveTo(xRight - 4, centerY - 4);
      ctx.lineTo(xRight + 4, centerY + 4);
      ctx.moveTo(xRight + 4, centerY - 4);
      ctx.lineTo(xRight - 4, centerY + 4);
      ctx.stroke();
      
      // Max (Square)
      const mRight = drawX + drawW - 23 - btnW;
      ctx.strokeRect(mRight - 5, centerY - 5, 10, 10);
      
      // Min (Dash)
      const minRight = drawX + drawW - 23 - btnW * 2;
      ctx.beginPath();
      ctx.moveTo(minRight - 5, centerY);
      ctx.lineTo(minRight + 5, centerY);
      ctx.stroke();
    } else if (['safari', 'chrome', 'arc'].includes(options.browserFrame)) {
      // Mac-style traffic lights
      const dotColors = ['#ff5f57', '#ffbd2e', '#28c940'];
      dotColors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(drawX + 16 + i * 20, drawY - frameHeight / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
    }
    
    // Frames for Mobile / Tablet / Desktop
    if (options.browserFrame === 'mobile' || options.browserFrame === 'tablet') {
       const bezel = options.browserFrame === 'mobile' ? 12 : 16;
       ctx.fillStyle = '#1a1a1a';
       // Outer Bezel
       ctx.beginPath();
       ctx.roundRect(drawX - bezel, drawY - bezel, drawW + bezel * 2, drawH + bezel * 2, r + bezel);
       ctx.fill();
       
       // Notch / Speaker
       ctx.fillStyle = '#000000';
       const notchW = options.browserFrame === 'mobile' ? drawW * 0.3 : drawW * 0.15;
       const notchH = 6;
       ctx.beginPath();
       ctx.roundRect(drawX + drawW / 2 - notchW / 2, drawY - bezel + 4, notchW, notchH, 3);
       ctx.fill();
    } else if (options.browserFrame === 'desktop') {
       const bezel = 20;
       // Frame
       ctx.fillStyle = '#222222';
       ctx.beginPath();
       ctx.roundRect(drawX - bezel, drawY - bezel, drawW + bezel * 2, drawH + bezel * 2, 12);
       ctx.fill();
       
       // Monitor Stand
       const standW = drawW * 0.2;
       const standH = 40;
       ctx.fillStyle = '#333333';
       ctx.fillRect(drawX + drawW / 2 - standW / 2, drawY + drawH + bezel, standW, standH);
       // Base
       const baseW = standW * 1.5;
       const baseH = 8;
       ctx.beginPath();
       ctx.roundRect(drawX + drawW / 2 - baseW / 2, drawY + drawH + bezel + standH - 4, baseW, baseH, 4);
       ctx.fill();
    }
    
    // Specific UI Elements for each browser
    if (options.browserFrame === 'safari') {
       ctx.fillStyle = '#ffffff';
       ctx.beginPath();
       ctx.roundRect(drawX + 100, drawY - frameHeight + 6, drawW - 200, frameHeight - 12, 6);
       ctx.fill();
       ctx.fillStyle = 'rgba(0,0,0,0.3)';
       ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
       ctx.textAlign = 'center';
       ctx.fillText('safari-browser.com', drawX + drawW/2, drawY - frameHeight/2 + 3);
    } else if (options.browserFrame === 'chrome') {
       const tabW = 140;
       ctx.fillStyle = '#ffffff';
       ctx.beginPath();
       ctx.roundRect(drawX + 80, drawY - frameHeight + 5, tabW, frameHeight - 5, [8, 8, 0, 0]);
       ctx.fill();
       ctx.fillStyle = '#3c4043';
       ctx.font = '10px sans-serif';
       ctx.textAlign = 'left';
       ctx.fillText('Google Chrome', drawX + 95, drawY - frameHeight / 2 + 3);
    } else if (options.browserFrame === 'arc') {
       const sidebarW = 40;
       ctx.fillStyle = 'rgba(255,255,255,0.05)';
       ctx.fillRect(drawX, drawY, sidebarW, drawH);
       ctx.strokeStyle = 'rgba(255,255,255,0.1)';
       ctx.beginPath();
       ctx.moveTo(drawX + sidebarW, drawY);
       ctx.lineTo(drawX + sidebarW, drawY + drawH);
       ctx.stroke();
       ctx.fillStyle = 'rgba(255,255,255,0.1)';
       ctx.beginPath();
       ctx.roundRect(drawX + 80, drawY - frameHeight + 6, drawW - 120, frameHeight - 12, 8);
       ctx.fill();
    }
    ctx.restore();
  }

  // 5. Draw Image
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(drawX, drawY, drawW, drawH, options.browserFrame !== 'none' ? [0, 0, r, r] : r);
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  ctx.restore();
}

/**
 * Làm đẹp ảnh (thường là ảnh chụp màn hình) bằng cách thêm background, bo góc và đổ bóng.
 */
export async function beautifyImage(
  file: File | HTMLImageElement,
  options: {
    paddingX: number;
    paddingY: number;
    borderRadius: number;
    shadowBlur: number;
    shadowColor: string;
    background: string;
    inset: number;
    rotation: number;
    scale: number;
    browserFrame: 'none' | 'safari' | 'chrome' | 'windows' | 'arc';
    noise: boolean;
    exportFormat?: 'png' | 'jpeg' | 'webp';
    exportQuality?: number;
  }
): Promise<Blob> {
  let img: HTMLImageElement;
  if (file instanceof File) {
    const dataUrl = await fileToDataURL(file);
    img = await loadImage(dataUrl);
  } else {
    img = file;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = img.width + options.paddingX * 2;
  canvas.height = img.height + options.paddingY * 2;

  drawBeautifiedImage(ctx, img, options);

  return new Promise((resolve, reject) => {
    const mimeType = options.exportFormat === 'jpeg' ? 'image/jpeg' : options.exportFormat === 'webp' ? 'image/webp' : 'image/png';
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Beautification failed'));
    }, mimeType, options.exportQuality ?? 1.0);
  });
}
