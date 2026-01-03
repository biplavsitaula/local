"use client";
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShieldX, ArrowLeft } from 'lucide-react';

interface AgeDeniedScreenProps {
  onBack?: () => void;
}

const AgeDeniedScreen: React.FC<AgeDeniedScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark background */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />

      {/* Modal with glowing orange border */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="relative rounded-2xl bg-black/90 p-8 md:p-12 text-center border-2 border-flame-orange shadow-[0_0_40px_rgba(255,140,0,0.3)]">
          {/* Shield Icon with Red Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-destructive flex items-center justify-center bg-destructive/10 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                <ShieldX className="w-12 h-12 text-destructive" />
              </div>
            </div>
          </div>

          {/* Access Denied Heading */}
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,140,0,0.5)]">
            {t('ageDenied')}
          </h1>

          {/* Message */}
          <p className="text-lg md:text-xl font-medium text-gray-300 mb-8">
            {t('ageDeniedMessage')}
          </p>

          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black/50 border-2 border-gray-700 text-white font-bold text-lg hover:bg-gray-800 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('back')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgeDeniedScreen;
