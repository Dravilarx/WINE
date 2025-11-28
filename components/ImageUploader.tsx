import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, XCircleIcon, CameraIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  imagePreview: string | null;
  onClearImage: () => void;
  onOpenCamera: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imagePreview, onClearImage, onOpenCamera }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if(e.dataTransfer.files[0].type.startsWith('image/')){
          onImageSelect(e.dataTransfer.files[0]);
      }
      e.dataTransfer.clearData();
    }
  }, [onImageSelect]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageSelect(e.target.files[0]);
    }
  };
  
  const onUploadClick = () => {
      fileInputRef.current?.click();
  }

  return (
    <div className="w-full">
      {imagePreview ? (
        <div className="relative group overflow-hidden rounded-2xl shadow-2xl border border-slate-700 bg-black">
          <img src={imagePreview} alt="Wine label preview" className="w-full h-auto max-h-[450px] object-contain opacity-90" />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-all duration-300 flex items-center justify-center">
             <button
                onClick={onClearImage}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-xl font-medium"
            >
                <XCircleIcon className="w-5 h-5" />
                <span>Eliminar imagen</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative overflow-hidden rounded-3xl p-8 text-center transition-all duration-300
            ${isDragging 
                ? 'bg-fuchsia-900/20 border-fuchsia-500 shadow-[0_0_40px_rgba(217,70,239,0.15)]' 
                : 'bg-slate-900/30 border-slate-700/50 hover:border-slate-600'
            } border-2 border-dashed flex flex-col items-center justify-center min-h-[300px] gap-6`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          
          <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-2 pointer-events-none">
             <UploadIcon className={`w-10 h-10 ${isDragging ? 'text-fuchsia-400' : 'text-slate-500'}`} />
          </div>

          <div className="pointer-events-none">
              <h3 className="text-xl font-bold text-white mb-2">Sube tu etiqueta</h3>
              <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Arrastra una imagen aquí</p>
          </div>

          <div className="w-full h-px bg-slate-800/80 my-2"></div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
             <button 
                onClick={onOpenCamera}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700 hover:border-slate-600 group"
             >
                 <CameraIcon className="w-5 h-5 text-fuchsia-400 group-hover:scale-110 transition-transform" />
                 <span>Usar Cámara</span>
             </button>
             <button 
                onClick={onUploadClick}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700 hover:border-slate-600 group"
             >
                 <UploadIcon className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                 <span>Subir Archivo</span>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};