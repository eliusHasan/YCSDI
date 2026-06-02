import { Check, Loader2, X, ZoomIn } from "lucide-react";
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

async function getCroppedBlob(src: string, crop: Area): Promise<Blob> {
  const image = await createImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width);
  canvas.height = Math.round(crop.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    image,
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(src, croppedAreaPixels);
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
              Drag to position · Scroll or use the slider to zoom
            </p>
          </div>

          <div className="relative w-full h-[340px] rounded-2xl overflow-hidden bg-black border border-white/10">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={PASSPORT_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={false}
            />
          </div>

          <div className="flex items-center gap-3 mt-5">
            <ZoomIn size={16} className="text-theme-soft shrink-0" />
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
