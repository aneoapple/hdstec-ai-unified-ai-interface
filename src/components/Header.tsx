import React, { useState, useRef } from 'react';
import { Home, Upload, X, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Header() {
  const { customLogo, setCustomLogo, isAdmin, createConversation } = useStore();
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogo(event.target?.result as string);
        setShowUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHomeClick = () => {
    createConversation('openai', 'gpt-4o');
  };

  const handleRemoveLogo = () => {
    setCustomLogo(null);
    setShowUpload(false);
  };

  return (
    <header className="h-20 glass border-b border-white/30 flex items-center justify-between px-8 relative z-10 shadow-brand">
      <div className="flex items-center gap-6">
        <button
          onClick={handleHomeClick}
          className="p-3 rounded-xl glass-hover transition-all duration-300 hover:scale-105 group"
          title="Home"
          style={{ color: 'var(--brand-600)' }}
        >
          <Home size={24} className="group-hover:opacity-80" />
        </button>
        
        <div className="logo-container">
          {customLogo ? (
            <img 
              src={customLogo} 
              alt="HDSTEC" 
              className="logo-upload"
            />
          ) : (
            <>
              <div className="logo-icon">
                <Sparkles size={20} className="text-white" />
              </div>
              <h1 className="logo-text">hdstec</h1>
            </>
          )}
          
          {isAdmin && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="p-2 rounded-lg glass-hover transition-all duration-200 hover:scale-105"
              title="Upload logo"
              style={{ color: 'var(--brand-600)' }}
            >
              <Upload size={18} />
            </button>
          )}
        </div>
      </div>

      {showUpload && isAdmin && (
        <div className="absolute top-full left-8 mt-3 glass-card p-5 min-w-[300px] animate-fade-in shadow-brand-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>Upload Logo</h3>
            <button
              onClick={() => setShowUpload(false)}
              className="p-1.5 rounded-lg glass-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/jpeg"
            onChange={handleLogoUpload}
            className="hidden"
          />
          
          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-5 py-3 gradient-brand text-white rounded-xl hover-brand font-semibold shadow-brand"
            >
              Escolher arquivo
            </button>
            
            {customLogo && (
              <button
                onClick={handleRemoveLogo}
                className="w-full px-5 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-semibold"
              >
                Remover logo
              </button>
            )}
          </div>
          
          <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
            Formatos aceitos: PNG, SVG, JPG
          </p>
        </div>
      )}
    </header>
  );
}
