/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, HelpCircle, RefreshCw, Scissors, Smile, FileImage } from 'lucide-react';
import { ImageProcessingOption } from '../types';

// Pre-drawn elegant SVG vectors representing the stylized fleet categories as fallbacks/presets
export const VEHICLE_PRESETS: Record<string, string> = {
  'Danfo (16-Seater Bus)': 'M2 7h16v8H2V7zm17 2h3l1 2v4h-4V9zm-13 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm10 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-7-9v8M14 7v8',
  'Korope (6-Seater Bus)': 'M3 8h12v7H3V8zm13 1h3l1 2v4h-4V9zm-9 6a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0zm8 0a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0zm-7-7v7M10 8v7',
  'Okada (Commercial Bike)': 'M5 16a3 3 0 100-6 3 3 0 000 6zm14 0a3 3 0 100-6 3 3 0 000 6zm-14-3h14M9 10l3-5h3l-2 5',
  'Keke Marwa (3-Wheeler Tricycle)': 'M3 13h10v3H3v-3zm11 0h4l2 3h-6v-3zM8 10l4-6h2v6M5 16a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm10 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  'Heavy Semi-Truck': 'M4 8h10v6H4V8zm12 2h4v4h-4v-4zM2 14v1h18v-3H2v2zm3 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  'Delivery Box Van': 'M3 5h11v9H3V5zm12 3h4l2 3v3h-6V8zM1 14v1h22v-2H1v1zm4 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm12 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  'Electric Sprinter': 'M2 6h12v8H2V6zm13 2h5l2 2v4h-7V8zM1 14v1h21v-1H1zm4 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm12 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  'Standard Cargo Carrier': 'M2 7h13v7H2V7zm14 2h4l2 2v3h-6V9zM1 14v1h22v-2H1v1zm4 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm13 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  'Custom': 'M4 8h10v6H4V8zm12 2h4v4h-4v-4zM2 14v1h18v-3H2v2zm3 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z'
};

interface VehicleProcessorProps {
  vehicleType: string;
  vehicleName: string;
  originalImage: string | null;
  processedImage: string | null;
  imageOption: ImageProcessingOption;
  onChange: (data: { originalImage: string | null; processedImage: string | null; imageOption: ImageProcessingOption }) => void;
}

export default function VehicleProcessor({
  vehicleType,
  vehicleName,
  originalImage,
  processedImage,
  imageOption,
  onChange,
}: VehicleProcessorProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [removedBgColor, setRemovedBgColor] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Drag handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Convert File to Base64 String
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorLog('Invalid format. Please upload a vehicle image file (.png, .jpeg, .jpg, .webp).');
      return;
    }

    setErrorLog(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const base64 = event.target.result as string;
        // Default to as-is initially on new upload
        onChange({
          originalImage: base64,
          processedImage: base64,
          imageOption: 'asis'
        });
      };
    };
    reader.onerror = () => {
      setErrorLog('Unable to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Perform background removal via canvas analysis
  const removeBackgroundClientSide = (base64: string) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Extract backdrop candidate color from corners (e.g. top-left pixel)
      const r_bg = data[0];
      const g_bg = data[1];
      const b_bg = data[2];

      setRemovedBgColor(`rgb(${r_bg}, ${g_bg}, ${b_bg})`);

      // Tolerance window
      const tolerance = 48;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance detection
        const dist = Math.sqrt(
          Math.pow(r - r_bg, 2) +
          Math.pow(g - g_bg, 2) +
          Math.pow(b - b_bg, 2)
        );

        if (dist < tolerance) {
          data[i + 3] = 0; // set absolute transparent alpha
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const transparentImg = canvas.toDataURL('image/png');
      onChange({
        originalImage: base64,
        processedImage: transparentImg,
        imageOption: 'nobg',
      });
    };
  };

  // Option trigger buttons
  const selectOption = async (option: ImageProcessingOption) => {
    if (!originalImage) {
      setErrorLog('Please upload a vehicle photo to apply design transformations.');
      return;
    }

    setErrorLog(null);
    setIsProcessing(true);

    if (option === 'asis') {
      onChange({
        originalImage,
        processedImage: originalImage,
        imageOption: 'asis',
      });
      setIsProcessing(false);
    } else if (option === 'nobg') {
      removeBackgroundClientSide(originalImage);
      setIsProcessing(false);
    } else if (option === 'cartoon') {
      // Call full-stack server-side Gemini pipeline
      try {
        const res = await fetch('/api/cartoonize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleType,
            vehicleName,
            originalImageBase64: originalImage,
          }),
        });

        const data = await res.json();
        
        if (data.success) {
          if (data.isFallback) {
            console.log('Gemini model reverted to stylized fallback preset.');
            // Create a gorgeous tinted vector style
            onChange({
              originalImage,
              processedImage: 'FALLBACK_PRESET_SVG',
              imageOption: 'cartoon',
            });
          } else {
            onChange({
              originalImage,
              processedImage: data.imageUrl,
              imageOption: 'cartoon',
            });
          }
        } else {
          setErrorLog('Server pipeline failed. Using stylized fallback caricature.');
          onChange({
            originalImage,
            processedImage: 'FALLBACK_PRESET_SVG',
            imageOption: 'cartoon',
          });
        }
      } catch (err) {
        console.error(err);
        setErrorLog('Network error. Applied local vector cartoon outline instead.');
        onChange({
          originalImage,
          processedImage: 'FALLBACK_PRESET_SVG',
          imageOption: 'cartoon',
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Helper renderer to represent fallback cartoon style vectors beautifully
  const renderFallbackVector = (type: string, sizeClass = 'w-24 h-24') => {
    const path = VEHICLE_PRESETS[type] || VEHICLE_PRESETS['Heavy Semi-Truck'];
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border-2 border-dashed border-cyan-300 dark:border-cyan-800 ${sizeClass}`}>
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-cyan-600 dark:text-cyan-400 fill-none stroke-current stroke-1.5 animate-pulse">
          <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
        <span className="text-[10px] mt-2 font-semibold text-cyan-700 dark:text-cyan-300 text-center uppercase tracking-wide">
          Cartoon Caricature
        </span>
      </div>
    );
  };

  return (
    <div id="vehicle-processor" className="space-y-4">
      {/* File Drop/Upload Zone */}
      {!originalImage ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
            isDragActive
              ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/35 hover:bg-slate-100 dark:hover:bg-slate-800/35'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-3" />
          <p className="text-sm font-medium text-slate-705 dark:text-slate-300 text-center">
            Drag and drop vehicle image, or <span className="text-cyan-600 dark:text-cyan-400 underline">browse</span>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center text-balance">
            Supports PNG, JPG, or WEBP. This helps personalize your investment visuals.
          </p>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Visual Display */}
            <div className="relative w-40 h-40 bg-slate-100 dark:bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center z-10 text-white text-xs gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <span>Processing...</span>
                </div>
              )}

              {imageOption === 'cartoon' && processedImage === 'FALLBACK_PRESET_SVG' ? (
                renderFallbackVector(vehicleType, 'w-full h-full border-none rounded-none bg-transparent')
              ) : imageOption === 'nobg' ? (
                <div className="relative w-full h-full flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
                  <img
                    src={processedImage || originalImage}
                    alt="No BG Vehicle"
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_8px_16px_rgba(8,145,178,0.3)] animate-fade-in"
                  />
                  <div className="absolute bottom-1 right-1 bg-cyan-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                    Transparent BG
                  </div>
                </div>
              ) : (
                <img
                  src={processedImage || originalImage}
                  alt="Vehicle View"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-cover"
                />
              )}
            </div>

            {/* Editing Commands */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Visual Options Engine
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Select how the rolling stock is presented to investors.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ originalImage: null, processedImage: null, imageOption: 'asis' })}
                  className="text-xs text-red-500 hover:underline hover:text-red-600 bg-transparent border-none cursor-pointer p-0"
                >
                  Remove Photo
                </button>
              </div>

              {/* Grid of selection */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="opt-asis"
                  type="button"
                  onClick={() => selectOption('asis')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    imageOption === 'asis'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 font-medium'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <FileImage className="w-4 h-4 mb-1" />
                  <span className="text-[11px]">As-Is Photo</span>
                </button>

                <button
                  id="opt-nobg"
                  type="button"
                  onClick={() => selectOption('nobg')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    imageOption === 'nobg'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 font-medium'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Scissors className="w-4 h-4 mb-1" />
                  <span className="text-[11px]">Isolate Body</span>
                </button>

                <button
                  id="opt-cartoon"
                  type="button"
                  onClick={() => selectOption('cartoon')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    imageOption === 'cartoon'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 font-medium'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Smile className="w-4 h-4 mb-1 animate-bounce" />
                  <span className="text-[11px]">Cartoon Sticker</span>
                </button>
              </div>

              {imageOption === 'nobg' && removedBgColor && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  * Detected background chroma base and masked it successfully.
                </p>
              )}

              {imageOption === 'cartoon' && processedImage === 'FALLBACK_PRESET_SVG' && (
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 italic">
                  * Dynamic fallback applied: Designed a customized cartoon representation for a {vehicleType}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {errorLog && (
        <p id="proc-error" className="text-xs text-red-500 font-medium">
          {errorLog}
        </p>
      )}

      {/* Hidden processing canvas used for background transparency extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
