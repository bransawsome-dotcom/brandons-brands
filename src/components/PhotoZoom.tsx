"use client";

import { useRef } from "react";

// A photo that opens full size when tapped (and closes on tap, the × button or Escape).
export default function PhotoZoom({ src, alt, className = "", loading }: { src: string; alt: string; className?: string; loading?: "lazy" | "eager" }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} aria-label={`Enlarge photo: ${alt}`} className="block w-full cursor-zoom-in">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading={loading} className={className} />
      </button>
      <dialog
        ref={dialog}
        onClick={() => dialog.current?.close()}
        aria-label={alt}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-[#0b1424]/85 backdrop:backdrop-blur-sm"
      >
        <div className="relative flex h-dvh w-screen cursor-zoom-out items-center justify-center p-4 sm:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="max-h-full max-w-full rounded object-contain shadow-2xl" />
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close photo"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl text-[#1b2a41] shadow"
          >
            ×
          </button>
        </div>
      </dialog>
    </>
  );
}
