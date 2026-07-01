'use client';

import { useState, useCallback, useRef } from 'react';

export default function CloudinaryUploaderPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setImageUrl(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) uploadToCloudinary(files[0]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setImageUrl(null);
    const files = e.target.files;
    if (files && files.length > 0) uploadToCloudinary(files[0]);
  }, []);

  const uploadToCloudinary = async (file: File) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Configuration Cloudinary manquante. Verifiez vos variables d\'environnement.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Veuillez selectionner une image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas depasser 10 Mo.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error('Erreur upload');
      const data = await response.json();
      setImageUrl(data.secure_url);
    } catch {
      setError('Erreur lors de l\'upload vers Cloudinary.');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async () => {
    if (imageUrl) {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setImageUrl(null);
    setError(null);
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cloudinary Uploader</h1>
          <p className="text-slate-400">Glissez-deposez une image pour l&apos;uploader sur Cloudinary</p>
        </div>

        {!imageUrl && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ease-out ${
              isDragging
                ? 'border-blue-400 bg-blue-500/10 scale-105'
                : 'border-slate-600 bg-slate-800/50 hover:border-slate-400 hover:bg-slate-800/80'
            }`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-lg">Upload en cours...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-lg font-medium mb-1">
                    {isDragging ? "Deposez l'image ici" : "Glissez-deposez une image"}
                  </p>
                  <p className="text-slate-400 text-sm">ou cliquez pour selectionner un fichier</p>
                </div>
                <p className="text-slate-500 text-xs mt-2">PNG, JPG, GIF, WEBP - Max 10 Mo</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {imageUrl && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6">
            <div className="relative rounded-xl overflow-hidden bg-slate-900">
              <img src={imageUrl} alt="Uploaded" className="w-full max-h-96 object-contain" />
            </div>
            <div className="space-y-3">
              <label className="text-slate-400 text-sm font-medium">Lien de l&apos;image sur Cloudinary</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  readOnly
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    copied ? 'bg-green-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {copied ? 'Copie !' : 'Copier'}
                </button>
              </div>
            </div>
            <button
              onClick={reset}
              className="w-full py-3 border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-400 transition-all"
            >
              Uploader une autre image
            </button>
          </div>
        )}

        <p className="text-center text-slate-600 text-sm mt-8">Propulse par Cloudinary API</p>
      </div>
    </div>
  );
}