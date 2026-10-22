import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Crop,
  Maximize2,
  Pen,
  Palette,
  Sparkles,
  Info,
  Check,
  X,
  Copy,
  Download,
  Trash2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
  Undo2,
  RefreshCw,
  Eye,
  Sliders,
  Wand2,
  Target
} from 'lucide-react';

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: string;
  dimensions: string;
  type: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg';
  category: 'Products' | 'Banners' | 'Logos' | 'General';
  uploadedAt: string;
  altText?: string;
  focalPoint?: { x: number; y: number };
  usedIn?: string;
}

interface ShopifyMediaDetailEditorProps {
  media: MediaItem;
  onBack: () => void;
  onSave: (updatedMedia: MediaItem) => void;
  onDelete?: (mediaId: string) => void;
  showToast?: (message: string) => void;
}

type ActiveTool = 'none' | 'crop' | 'resize' | 'draw' | 'background' | 'generate';

export const ShopifyMediaDetailEditor: React.FC<ShopifyMediaDetailEditorProps> = ({
  media,
  onBack,
  onSave,
  onDelete,
  showToast = (_msg: string) => {}
}) => {
  // Metadata state
  const [name, setName] = useState(media.name);
  const [altText, setAltText] = useState(media.altText || '');
  const [dimensions, setDimensions] = useState(media.dimensions || '1254 × 1254');
  const [fileSize, setFileSize] = useState(media.size || '1.77 MB');

  // Focal point state
  const [isFocalMode, setIsFocalMode] = useState(false);
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number } | null>(
    media.focalPoint || { x: 50, y: 50 }
  );

  // Active editor tool modal/drawer
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');

  // Image display / transform state
  const [imageUrl, setImageUrl] = useState(media.url);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | '4:3' | '16:9' | '3:4'>('free');

  // Resize tool state
  const [resizeWidth, setResizeWidth] = useState<number>(() => {
    const parts = media.dimensions.split('×').map((s) => parseInt(s.trim(), 10));
    return parts[0] || 1254;
  });
  const [resizeHeight, setResizeHeight] = useState<number>(() => {
    const parts = media.dimensions.split('×').map((s) => parseInt(s.trim(), 10));
    return parts[1] || 1254;
  });
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // Drawing tool state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#EF4444');
  const [brushSize, setBrushSize] = useState(4);
  const [drawMode, setDrawMode] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);

  // Background color state
  const [bgColor, setBgColor] = useState('transparent');
  const [bgPadding, setBgPadding] = useState(0);
  const [bgRadius, setBgRadius] = useState(0);

  // AI / Generate enhancement state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('normal');

  // Ref to image container for click coordinates
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // Handle Focal Point click
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFocalMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setFocalPoint({ x, y });
    showToast(`ফোকাল পয়েন্ট সেট করা হয়েছে: ${x}%, ${y}%`);
  };

  // Drawing Canvas Initialization
  useEffect(() => {
    if (activeTool === 'draw' && canvasRef.current && imageContainerRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = imageContainerRef.current.clientWidth || 500;
        canvas.height = imageContainerRef.current.clientHeight || 500;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTool]);

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history for undo
    setDrawingHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
    } else if (drawMode === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawColor;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = brushSize * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawColor;
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = brushSize;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const undoDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || drawingHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const prev = drawingHistory[drawingHistory.length - 1];
    ctx.putImageData(prev, 0, 0);
    setDrawingHistory((h) => h.slice(0, -1));
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setDrawingHistory([]);
    }
  };

  // Apply Drawing
  const handleApplyDrawing = () => {
    showToast('অঙ্কন সফলভাবে ছবিতে যুক্ত হয়েছে');
    setActiveTool('none');
  };

  // Apply Crop & Transform
  const handleApplyCrop = () => {
    showToast('ক্রপ ও ট্র্যান্সফর্ম সংরক্ষিত হয়েছে');
    setActiveTool('none');
  };

  // Apply Resize
  const handleApplyResize = () => {
    setDimensions(`${resizeWidth} × ${resizeHeight}`);
    const estimatedKb = Math.round((resizeWidth * resizeHeight * 1.5) / 1024);
    setFileSize(estimatedKb > 1024 ? `${(estimatedKb / 1024).toFixed(2)} MB` : `${estimatedKb} KB`);
    showToast(`সাইজ পরিবর্তন করা হয়েছে: ${resizeWidth} × ${resizeHeight}`);
    setActiveTool('none');
  };

  // AI Generation Simulation
  const handleApplyAIEnhance = (type: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setActiveFilter(type);
      showToast('AI এনহান্সমেন্ট সফলভাবে প্রয়োগ করা হয়েছে!');
      setActiveTool('none');
    }, 900);
  };

  // Save all changes
  const handleSaveAll = () => {
    const updated: MediaItem = {
      ...media,
      name: name.trim() || media.name,
      altText,
      dimensions,
      size: fileSize,
      url: imageUrl,
      focalPoint: focalPoint || undefined
    };

    onSave(updated);
    showToast('মিডিয়া ফাইল সফলভাবে আপডেট করা হয়েছে!');
  };

  // Copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(imageUrl);
    showToast('ছবির লিঙ্ক কপি করা হয়েছে!');
  };

  // Download
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = name || 'image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('ডাউনলোড শুরু হয়েছে...');
  };

  // Helper for filter classes
  const getFilterStyle = () => {
    if (activeFilter === 'studio') return 'contrast-105 brightness-105 saturate-110 shadow-2xl';
    if (activeFilter === 'vibrant') return 'saturate-150 contrast-110';
    if (activeFilter === 'shadow') return 'drop-shadow-2xl';
    if (activeFilter === 'sharp') return 'contrast-125 brightness-102';
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0f11] text-white flex flex-col font-sans select-none animate-in fade-in duration-200">
      {/* 1. TOP HEADER (Matching Screenshot: <- BX-miniThermalBluetoothPrinter) */}
      <header className="h-14 border-b border-[#24272a] bg-[#141619] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Back to Content files"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-gray-100 tracking-tight">{name}</h1>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
              {dimensions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy URL"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy link</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download image"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-1.5 rounded-lg bg-[#2c6ecb] hover:bg-[#1f5bb5] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEW: Canvas on Left & Center, Information / Tools Sidebar on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* 2. MAIN CENTER CANVAS (Patterned Dotted Dark Background) */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-6 overflow-hidden bg-[#090a0c]">
          {/* Subtle Dotted Pattern Overlay matching screenshot */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Central Image Container */}
          <div
            ref={imageContainerRef}
            onClick={handleImageClick}
            className={`relative max-w-full max-h-[75vh] flex items-center justify-center transition-all ${
              isFocalMode ? 'cursor-crosshair' : 'cursor-default'
            }`}
            style={{
              backgroundColor: bgColor !== 'transparent' ? bgColor : undefined,
              padding: `${bgPadding}px`,
              borderRadius: `${bgRadius}px`
            }}
          >
            {/* The Image */}
            <div
              className="relative overflow-hidden transition-all shadow-2xl"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                borderRadius: `${bgRadius}px`
              }}
            >
              <img
                src={imageUrl}
                alt={altText || name}
                className={`max-h-[72vh] max-w-[70vw] object-contain rounded-md select-none ${getFilterStyle()}`}
                draggable={false}
              />

              {/* Interactive Drawing Canvas Overlay (when Draw mode active) */}
              {activeTool === 'draw' && (
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="absolute inset-0 w-full h-full cursor-crosshair z-20"
                />
              )}

              {/* Crop Aspect Ratio Guidelines (when Crop mode active) */}
              {activeTool === 'crop' && (
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-400/90 z-20">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-b border-white/20" />
                    <div className="border-r border-white/20" />
                    <div className="border-r border-white/20" />
                    <div className="" />
                  </div>
                </div>
              )}

              {/* Focal Point Indicator Reticle */}
              {focalPoint && (
                <div
                  className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150"
                  style={{ left: `${focalPoint.x}%`, top: `${focalPoint.y}%` }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-blue-400 bg-blue-500/25 flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-xs" />
                  </div>
                  <span className="absolute left-9 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-mono font-bold bg-black/80 text-blue-300 px-1.5 py-0.5 rounded shadow">
                    {focalPoint.x}%, {focalPoint.y}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. FLOATING BOTTOM PILL: "◉ Click image to set focal point" (Matching Screenshot) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
            <button
              type="button"
              onClick={() => setIsFocalMode(!isFocalMode)}
              className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2.5 shadow-xl transition-all border ${
                isFocalMode
                  ? 'bg-blue-600 text-white border-blue-400 shadow-blue-900/50 scale-105'
                  : 'bg-[#181a1d]/90 hover:bg-[#202327] text-gray-200 border-zinc-700/80 backdrop-blur-md'
              } cursor-pointer`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isFocalMode ? 'bg-white animate-pulse' : 'bg-blue-400'
                }`}
              />
              <span>{isFocalMode ? 'Click on image to place target' : 'Click image to set focal point'}</span>
              {focalPoint && isFocalMode && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setFocalPoint(null);
                    showToast('ফোকাল পয়েন্ট রিসেট করা হয়েছে');
                  }}
                  className="ml-1 text-[10px] underline hover:text-white"
                >
                  Reset
                </span>
              )}
            </button>
          </div>
        </main>

        {/* 4. RIGHT SIDEBAR (Matching Screenshot: Information, Name, Alt text, Details, Used in, Action buttons) */}
        <aside className="w-80 md:w-96 border-l border-[#24272a] bg-[#141619] flex flex-col justify-between overflow-y-auto shrink-0">
          <div className="p-5 space-y-6">
            {/* Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-200">
                <Info className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold">Information</h2>
              </div>

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Image file name"
                  className="w-full bg-[#1c1f23] border border-[#32363b] rounded-lg px-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Alt Text Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">Alt text</label>
                <textarea
                  rows={2}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image for SEO and screen readers"
                  className="w-full bg-[#1c1f23] border border-[#32363b] rounded-lg px-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Details (Format • Dimensions • Size • Date) */}
              <div className="space-y-1 text-xs text-gray-400 border-t border-[#24272a] pt-3 font-mono">
                <p className="font-semibold text-gray-300">Details</p>
                <p className="text-[11px] text-gray-400">
                  {media.type ? media.type.split('/')[1]?.toUpperCase() : 'PNG'} • {dimensions} • {fileSize}
                </p>
                <p className="text-[11px] text-gray-500">Added {media.uploadedAt || 'Sep 25, 2026'}</p>
              </div>

              {/* Used In */}
              <div className="space-y-1 text-xs text-gray-400 border-t border-[#24272a] pt-3">
                <p className="font-semibold text-gray-300">Used in</p>
                <p className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                  {media.usedIn || 'Products (1)'}
                </p>
              </div>
            </div>

            {/* 5 ACTION BUTTONS (Exact match to screenshot) */}
            <div className="space-y-2.5 pt-2 border-t border-[#24272a]">
              {/* 1. Crop and transform */}
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'crop' ? 'none' : 'crop')}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors border ${
                  activeTool === 'crop'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#1e2226] hover:bg-[#272b30] text-gray-200 border-[#2b3036]'
                } cursor-pointer`}
              >
                <Crop className="w-4 h-4 text-gray-300" />
                <span>Crop and transform</span>
              </button>

              {/* Crop and transform Sub-Panel */}
              {activeTool === 'crop' && (
                <div className="p-3 bg-[#191c20] border border-zinc-700/80 rounded-xl space-y-3 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px] text-gray-300">
                    <span>Aspect Ratio</span>
                    <span className="font-mono text-blue-400">{cropAspect}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                    {(['free', '1:1', '4:3', '16:9'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setCropAspect(ratio)}
                        className={`py-1 rounded text-center font-medium border ${
                          cropAspect === ratio
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-gray-300">Transform</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r - 90) % 360)}
                        className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-gray-200"
                        title="Rotate Counter-Clockwise"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-gray-200"
                        title="Rotate Clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipH(!flipH)}
                        className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-gray-200"
                        title="Flip Horizontal"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipV(!flipV)}
                        className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-gray-200"
                        title="Flip Vertical"
                      >
                        <FlipVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Zoom</span>
                      <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRotation(0);
                        setFlipH(false);
                        setFlipV(false);
                        setZoom(1);
                        setCropAspect('free');
                      }}
                      className="flex-1 py-1 rounded border border-zinc-700 hover:bg-zinc-800 text-[11px]"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyCrop}
                      className="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px]"
                    >
                      Apply Crop
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Resize */}
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'resize' ? 'none' : 'resize')}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors border ${
                  activeTool === 'resize'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#1e2226] hover:bg-[#272b30] text-gray-200 border-[#2b3036]'
                } cursor-pointer`}
              >
                <Maximize2 className="w-4 h-4 text-gray-300" />
                <span>Resize</span>
              </button>

              {/* Resize Sub-Panel */}
              {activeTool === 'resize' && (
                <div className="p-3 bg-[#191c20] border border-zinc-700/80 rounded-xl space-y-3 text-xs animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">Width (px)</label>
                      <input
                        type="number"
                        value={resizeWidth}
                        onChange={(e) => {
                          const w = parseInt(e.target.value, 10) || 100;
                          setResizeWidth(w);
                          if (lockAspectRatio) {
                            setResizeHeight(w);
                          }
                        }}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">Height (px)</label>
                      <input
                        type="number"
                        value={resizeHeight}
                        onChange={(e) => {
                          const h = parseInt(e.target.value, 10) || 100;
                          setResizeHeight(h);
                          if (lockAspectRatio) {
                            setResizeWidth(h);
                          }
                        }}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lockAspectRatio}
                        onChange={(e) => setLockAspectRatio(e.target.checked)}
                        className="rounded border-zinc-700 text-blue-600 focus:ring-0"
                      />
                      <span>Lock aspect ratio</span>
                    </label>
                    <span className="text-gray-500 font-mono">
                      ~{Math.round((resizeWidth * resizeHeight * 1.5) / 1024)} KB
                    </span>
                  </div>

                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {[
                      { label: 'Original (1254)', w: 1254, h: 1254 },
                      { label: 'HD (1080)', w: 1080, h: 1080 },
                      { label: 'Std (800)', w: 800, h: 800 },
                      { label: 'Thumb (600)', w: 600, h: 600 }
                    ].map((ps) => (
                      <button
                        key={ps.label}
                        type="button"
                        onClick={() => {
                          setResizeWidth(ps.w);
                          setResizeHeight(ps.h);
                        }}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-mono"
                      >
                        {ps.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyResize}
                    className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                  >
                    Apply Resize
                  </button>
                </div>
              )}

              {/* 3. Draw */}
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'draw' ? 'none' : 'draw')}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors border ${
                  activeTool === 'draw'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#1e2226] hover:bg-[#272b30] text-gray-200 border-[#2b3036]'
                } cursor-pointer`}
              >
                <Pen className="w-4 h-4 text-gray-300" />
                <span>Draw</span>
              </button>

              {/* Draw Sub-Panel */}
              {activeTool === 'draw' && (
                <div className="p-3 bg-[#191c20] border border-zinc-700/80 rounded-xl space-y-3 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDrawMode('pen')}
                      className={`flex-1 py-1 rounded text-center font-medium border ${
                        drawMode === 'pen'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      Pen
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawMode('highlighter')}
                      className={`flex-1 py-1 rounded text-center font-medium border ${
                        drawMode === 'highlighter'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      Highlighter
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawMode('eraser')}
                      className={`flex-1 py-1 rounded text-center font-medium border ${
                        drawMode === 'eraser'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      Eraser
                    </button>
                  </div>

                  {/* Colors */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400">Color</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#FFFFFF', '#000000'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setDrawColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            drawColor === c ? 'border-blue-400 scale-110' : 'border-zinc-700'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Brush Size */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Brush size</span>
                      <span>{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={undoDrawing}
                      className="p-1.5 rounded border border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                      title="Undo"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={clearDrawing}
                      className="flex-1 py-1 rounded border border-zinc-700 hover:bg-zinc-800 text-[11px]"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyDrawing}
                      className="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Color background */}
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'background' ? 'none' : 'background')}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors border ${
                  activeTool === 'background'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#1e2226] hover:bg-[#272b30] text-gray-200 border-[#2b3036]'
                } cursor-pointer`}
              >
                <Palette className="w-4 h-4 text-gray-300" />
                <span>Color background</span>
              </button>

              {/* Color background Sub-Panel */}
              {activeTool === 'background' && (
                <div className="p-3 bg-[#191c20] border border-zinc-700/80 rounded-xl space-y-3 text-xs animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-gray-300 block">Backdrop Color</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'None', val: 'transparent', color: '#111' },
                        { label: 'White', val: '#ffffff', color: '#fff' },
                        { label: 'Gray', val: '#f1f5f9', color: '#f1f5f9' },
                        { label: 'Dark', val: '#0f172a', color: '#0f172a' },
                        { label: 'Rose', val: '#fff1f2', color: '#fff1f2' },
                        { label: 'Amber', val: '#fef3c7', color: '#fef3c7' },
                        { label: 'Mint', val: '#ecfdf5', color: '#ecfdf5' },
                        { label: 'Blue', val: '#f0f9ff', color: '#f0f9ff' }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setBgColor(preset.val)}
                          className={`py-1 px-1 rounded text-center text-[10px] font-medium border flex items-center justify-center gap-1 ${
                            bgColor === preset.val
                              ? 'border-blue-400 bg-zinc-700 text-white'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-zinc-600"
                            style={{ backgroundColor: preset.color }}
                          />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Padding / Margin</span>
                      <span>{bgPadding}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      value={bgPadding}
                      onChange={(e) => setBgPadding(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Corner Radius</span>
                      <span>{bgRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={32}
                      value={bgRadius}
                      onChange={(e) => setBgRadius(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      showToast('ব্যাকগ্রাউন্ড কালার সফলভাবে প্রয়োগ হয়েছে');
                      setActiveTool('none');
                    }}
                    className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                  >
                    Apply Background
                  </button>
                </div>
              )}

              {/* 5. Generate */}
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'generate' ? 'none' : 'generate')}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors border ${
                  activeTool === 'generate'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-indigo-400 shadow-md'
                    : 'bg-[#1e2226] hover:bg-[#272b30] text-gray-200 border-[#2b3036]'
                } cursor-pointer`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate</span>
                <span className="ml-auto text-[9px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  AI
                </span>
              </button>

              {/* Generate Sub-Panel */}
              {activeTool === 'generate' && (
                <div className="p-3 bg-[#191c20] border border-indigo-900/60 rounded-xl space-y-2.5 text-xs animate-in fade-in duration-150">
                  <p className="text-[11px] text-gray-300 font-medium">Smart Product Enhancements</p>

                  <div className="space-y-1.5">
                    {[
                      {
                        id: 'studio',
                        label: 'Clean Studio White',
                        desc: 'Isolated bright e-commerce studio background'
                      },
                      {
                        id: 'vibrant',
                        label: 'Auto Color & Contrast Boost',
                        desc: 'Vibrant punchy retail product enhancement'
                      },
                      {
                        id: 'shadow',
                        label: 'Soft Product Drop Shadow',
                        desc: 'Adds realistic floating 3D grounding depth'
                      },
                      {
                        id: 'sharp',
                        label: 'HD Sharpen & Clarity',
                        desc: 'Enhances fine labels, typography and textures'
                      }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isGenerating}
                        onClick={() => handleApplyAIEnhance(opt.id)}
                        className={`w-full p-2 rounded-lg text-left border transition-all ${
                          activeFilter === opt.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-white'
                            : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[11px]">{opt.label}</span>
                          {activeFilter === opt.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {isGenerating && (
                    <div className="p-2 bg-indigo-950/60 border border-indigo-500/40 rounded-lg flex items-center justify-center gap-2 text-indigo-300 text-xs">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating enhancement...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Delete Action */}
          {onDelete && (
            <div className="p-4 border-t border-[#24272a] bg-[#111315]">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${name}"?`)) {
                    onDelete(media.id);
                  }
                }}
                className="w-full py-2 rounded-lg border border-rose-900/60 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete file</span>
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
