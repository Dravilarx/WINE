import React, { useRef, useEffect, useState } from 'react';
import { XCircleIcon } from './icons';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("No se pudo acceder a la cámara. Por favor verifica los permisos del dispositivo.");
        console.error(err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                onCapture(file);
            }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  if (error) {
      return (
          <div className="h-[400px] flex flex-col items-center justify-center p-8 bg-slate-900 rounded-3xl border border-red-500/20 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <XCircleIcon className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-200 mb-6 max-w-xs font-medium">{error}</p>
              <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition-colors font-medium text-sm">
                  Volver al escáner
              </button>
          </div>
      )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black shadow-2xl h-[450px] group">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover opacity-90"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center z-10">
         <button 
            onClick={onClose} 
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95"
            aria-label="Cerrar cámara"
         >
            <XCircleIcon className="w-6 h-6" />
         </button>
         
         <button 
            onClick={handleCapture} 
            className="group/shutter relative flex items-center justify-center p-1"
            aria-label="Tomar foto"
         >
             <div className="absolute inset-0 bg-fuchsia-500/20 rounded-full blur-xl group-hover/shutter:bg-fuchsia-500/40 transition-all"></div>
             <div className="w-16 h-16 rounded-full border-4 border-white transition-all group-active/shutter:scale-95 flex items-center justify-center z-10">
                <div className="w-12 h-12 bg-white rounded-full group-active/shutter:bg-fuchsia-200 transition-colors"></div>
             </div>
         </button>
         
         <div className="w-12"></div> {/* Spacer for balance */}
      </div>

      <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur text-xs font-medium text-white/80 border border-white/10">
              Apunta a la etiqueta
          </span>
      </div>
    </div>
  );
};