import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShieldX } from 'lucide-react';

const AgeDeniedScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center galaxy-bg">
      <div className="text-center p-8">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center">
            <ShieldX className="w-12 h-12 text-destructive" />
          </div>
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          {t('ageDenied')}
        </h1>
        <p className="text-muted-foreground max-w-md">
          {t('ageDeniedMessage')}
        </p>
      </div>
    </div>
  );
};

export default AgeDeniedScreen;
