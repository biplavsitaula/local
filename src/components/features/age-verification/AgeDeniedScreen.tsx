"use client";
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShieldX, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

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
      <div className="relative z-10 w-full max-w-lg mx-auto ">
        <div className="relative rounded-2xl bg-card-purple p-6 md:p-8 text-center border-2 border-flame-orange shadow-[0_0_40px_rgba(255,140,0,0.3)]">
          {/* Shield Icon with Red Circle */}
          <div className="flex justify-center mb-5">
            {/* <div className="w-20 h-20 rounded-full border-4 border-destructive flex items-center justify-center bg-destructive/10 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
              <ShieldX className="w-10 h-10 text-destructive" />
            </div> */}
            <Image
              src="/assets/flame200.png"
              alt="Flame Beverage logo"
              width={180}
              height={48}
              className="h-8 w-auto sm:h-10 md:h-12 object-contain"
              priority
            />
          </div>

          {/* Access Denied Heading */}
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 text-primary-gradient-glow">
            {t('ageDenied')}
          </h1>

          {/* Message */}
          <p className="text-base md:text-lg font-medium text-muted-foreground mb-6">
            {t('ageDeniedMessage')}
          </p>

          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="btn-default-custom inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl cursor-pointer hover:border-color-primary"
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
