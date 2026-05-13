"use client";

import { useCallback, useMemo, useState, useRef } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { ImagePlus } from "lucide-react";
import { resolveDishPhotoUrl } from "@/lib/dishPhoto";
import type { DishPhoto } from "@/lib/dishPhoto";

type UploadedPhoto = DishPhoto & {
    fullUrl: string | null;
    smallUrl: string | null;
};

export default function DishPhotoUploader({ dishId, currentPhotoUrl, onUploadSuccess }: { dishId: string; currentPhotoUrl?: string | null; onUploadSuccess?: (photo: UploadedPhoto) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);

    const [busy, setBusy] = useState(false);

    // Derive the display URL directly from the parent's props to prevent stale state across dish selection
    const displayUrl = useMemo(() => resolveDishPhotoUrl(currentPhotoUrl), [currentPhotoUrl]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const open = useMemo(() => !!imageUrl, [imageUrl]);

    const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
        setCroppedPixels(areaPixels);
    }, []);

    function onPick(f: File | null) {
        setFile(f);
        if (!f) return;
        const url = URL.createObjectURL(f);
        setImageUrl(url);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setCroppedPixels(null);
    }

    async function upload() {
        if (!file || !croppedPixels) return;
        setBusy(true);

        try {
            const form = new FormData();
            form.append("dishId", dishId);
            form.append("file", file);
            form.append("crop", JSON.stringify(croppedPixels));

            const r = await fetch("/api/admin/menu/dishes/photo", { method: "POST", body: form });
            const j = await r.json().catch(() => null);

            if (!r.ok) {
                alert(j?.error ?? "Upload failed");
                return;
            }

            const uploadedPhoto: UploadedPhoto = {
                ...j.photo,
                fullUrl: j?.urls?.full ?? resolveDishPhotoUrl(j?.photo?.full, j?.photo?.timestamp),
                smallUrl: j?.urls?.small ?? resolveDishPhotoUrl(j?.photo?.small, j?.photo?.timestamp),
            };

            if (onUploadSuccess) onUploadSuccess(uploadedPhoto);

            // close modal
            if (imageUrl) URL.revokeObjectURL(imageUrl);
            setImageUrl(null);
            setFile(null);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setBusy(false);
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onPick(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {!open && (
                <div
                    className={`relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 flex items-center justify-center ${isDragOver ? "border-[#c5a880] bg-[#c5a880]/10" : displayUrl ? "border-transparent" : "border-dashed border-white/20 hover:border-white/40 hover:bg-white/5"
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {displayUrl ? (
                        <>
                            <img src={displayUrl} alt="Dish photo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center flex-col gap-2 backdrop-blur-sm">
                                <ImagePlus size={28} className="text-white" />
                                <span className="text-white font-medium text-sm">Change Photo</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-white/50 gap-3 pointer-events-none p-4 text-center">
                            <ImagePlus size={32} className="opacity-60" />
                            <div>
                                <span className="text-white/80 font-medium">Click to upload</span> or drag and drop
                            </div>
                            <span className="text-[10px] uppercase tracking-widest opacity-60">16:9 Aspect Ratio</span>
                        </div>
                    )}
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                    onPick(e.target.files?.[0] ?? null);
                    if (e.target) e.target.value = ''; // reset input
                }}
            />

            {open && (
                <div style={{ marginTop: 12, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ position: "relative", width: "100%", height: 260, background: "#0b0d12" }}>
                        <Cropper
                            image={imageUrl!}
                            crop={crop}
                            zoom={zoom}
                            aspect={16 / 9}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "rgba(255,255,255,0.05)" }}>
                        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                            Zoom
                            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ flex: 1 }} />
                        </label>

                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <button className="btn btnPrimary" style={{ flex: 1, padding: "8px 12px", justifyContent: "center" }} onClick={upload} disabled={busy || !croppedPixels}>
                                {busy ? "Uploading..." : "Save Photo"}
                            </button>

                            <button
                                className="btn"
                                style={{ flex: 1, padding: "8px 12px", justifyContent: "center" }}
                                onClick={() => {
                                    if (imageUrl) URL.revokeObjectURL(imageUrl);
                                    setImageUrl(null);
                                    setFile(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
