import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, XCircleIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  imagePreview: string | null;
  onClearImage: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imagePreview, onClearImage }) => {
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
  
  const onButtonClick = () => {
      fileInputRef.current?.click();
  }

  return (
    <div className="w-full">
      {imagePreview ? (
        <div className="relative group">
          <img src={imagePreview} alt="Wine label preview" className="w-full h-auto max-h-96 object-contain rounded-lg shadow-lg" />
          <button
            onClick={onClearImage}
            className="absolute top-2 right-2 p-1 bg-slate-900/60 rounded-full text-white hover:bg-opacity-80 transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
            ${isDragging ? 'border-purple-500 bg-slate-800 ring-4 ring-purple-500/20' : 'border-slate-700 hover:border-purple-600 hover:bg-slate-800'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center text-slate-400">
             <UploadIcon className="w-12 h-12 mb-4 text-slate-500" />
            <p className="text-lg font-semibold text-slate-300">Arrastra y suelta una imagen aquí</p>
            <p className="text-sm">o haz clic para seleccionar un archivo</p>
          </div>
        </div>
      )}
    </div>
  );
};