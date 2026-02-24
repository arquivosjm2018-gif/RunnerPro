import React, { useState, useRef } from 'react';
import { ImageIcon, Upload, Loader2, Sparkles, Copy, Check, Camera } from 'lucide-react';
import { generateCaptionFromImage } from '../services/geminiService';
import Markdown from 'react-markdown';
import { User } from '../types';

export default function CaptionGenerator({ user }: { user: User | null }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await generateCaptionFromImage(image, 'image/jpeg');
      setResult(res || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
          <Camera size={32} />
        </div>
        <h1 className="text-3xl font-display font-bold text-zinc-900">Legenda Automática por Foto</h1>
        <p className="text-zinc-500 mt-2">Envie sua foto de treino ou prova e deixe a IA criar a legenda perfeita.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="glass-card aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 hover:border-emerald-500 cursor-pointer overflow-hidden group transition-all"
          >
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Upload size={24} />
                </div>
                <p className="font-bold text-zinc-900">Clique para enviar</p>
                <p className="text-sm text-zinc-500 mt-1">ou arraste sua foto aqui</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={!image || loading}
            className="btn-primary w-full"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Analisar Foto e Gerar Legendas
          </button>
        </div>

        <div className="glass-card p-6 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-zinc-900">Legendas Geradas</h3>
            {result && (
              <button 
                onClick={copyToClipboard}
                className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm font-bold"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-zinc-50 rounded-xl p-6 overflow-y-auto border border-zinc-100">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                <div className="relative">
                  <Loader2 className="animate-spin" size={48} />
                  <ImageIcon className="absolute inset-0 m-auto" size={20} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-zinc-900">Analisando sua performance...</p>
                  <p className="text-sm">Identificando ambiente, emoção e clima.</p>
                </div>
              </div>
            ) : result ? (
              <div className="prose prose-zinc prose-sm max-w-none">
                <Markdown>{result}</Markdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center space-y-2">
                <ImageIcon size={48} strokeWidth={1} />
                <p className="text-sm">O resultado da análise aparecerá aqui.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
