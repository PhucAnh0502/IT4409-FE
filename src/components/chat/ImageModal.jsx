import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ImageModal = ({ isOpen, onClose, images, currentIndex, onNext, onPrev }) => {
useEffect(() => {
    const handleKeyDown = (e) => {
        if (!isOpen) return;
        if (e.key === "ArrowRight") onNext(e);
        if (e.key === "ArrowLeft") onPrev(e);
        if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
}, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentSrc = images[currentIndex];
  const showNav = images.length > 1;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
        onClick={onClose}
      >
        <X size={24} />
      </button>

      <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        
        {showNav && (
          <button 
            className="absolute left-2 sm:left-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all z-50 group"
            onClick={(e) => { e.stopPropagation(); onPrev(e); }}
          >
            <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        )}

        <img 
          src={currentSrc} 
          alt="Full View" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
        />

        {showNav && (
          <button 
            className="absolute right-2 sm:right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all z-50 group"
            onClick={(e) => { e.stopPropagation(); onNext(e); }}
          >
            <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {showNav && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;