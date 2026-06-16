import { Check, Loader2, RotateCcw, RotateCw, X, ZoomIn } from "lucide-react";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

// Standard passport photo ratio is 35mm x 45mm.
const PASSPORT_ASPECT = 35 / 45;

interface Props {
  src: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.src = url;
  });
}

function getRadianAngle(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Dimensions of the bounding box that contains a rotated rectangle.
function rotateSize(width: number, height: number, rotation: number) {
  const rad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

async function getCroppedBlob(src: string, crop: Area, rotation: number): Promise<Blob> {
  const image = await createImage(src);

  // Draw the rotated image onto a canvas sized to its rotated bounding box.
  const rotated = document.createElement("canvas");
  const rotatedCtx = rotated.getContext("2d");
  if (!rotatedCtx) throw new Error("Canvas not supported");

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation,
  );
  rotated.width = bBoxWidth;
  rotated.height = bBoxHeight;

  rotatedCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  rotatedCtx.rotate(getRadianAngle(rotation));
  rotatedCtx.translate(-image.width / 2, -image.height / 2);
  rotatedCtx.drawImage(image, 0, 0);

  // Extract the crop region (its coordinates are in the rotated image space).
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width);
  canvas.height = Math.round(crop.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    rotated,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to crop image"))),
      "image/jpeg",
      0.92,
    );
  });
}

export function PhotoCropModal({ src, onCancel, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  // Wrap to keep the slider in sync after quarter-turn buttons (0–359).
  const rotateBy = (delta: number) => setRotation((r) => (((r + delta) % 360) + 360) % 360);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(src, croppedAreaPixels, rotation);
      onConfirm(blob);
    } catch {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-theme-dark/90 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-theme-dark border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl my-8">
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-5 right-5 p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="text-center mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-white">Crop Passport Photo</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
              Drag to position · Zoom and rotate with the sliders
            </p>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={() => rotateBy(-90)}
              title="Rotate left 90°"
              className="flex items-center gap-1.5 shrink-0 w-16 text-[10px] font-black uppercase tracking-widest text-theme-soft hover:text-white transition-colors"
            >
              <RotateCcw size={14} /> Rotate
            </button>
            <input
              type="range"
              min={0}
              max={359}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full accent-[#E2B26A] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => rotateBy(90)}
              title="Rotate right 90°"
              className="shrink-0 p-1.5 rounded-lg text-theme-soft hover:bg-white/5 transition-colors"
            >
              <RotateCw size={16} />
            </button>
          </div>

          <div className="relative w-full h-[340px] rounded-2xl overflow-hidden bg-black border border-white/10">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={PASSPORT_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              showGrid={false}
            />
          </div>

          <div className="flex items-center gap-3 mt-5">
            <span className="flex items-center gap-1.5 shrink-0 w-16 text-[10px] font-black uppercase tracking-widest text-theme-soft">
              <ZoomIn size={14} /> Zoom
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#E2B26A] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="py-3.5 rounded-xl border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={processing || !croppedAreaPixels}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
