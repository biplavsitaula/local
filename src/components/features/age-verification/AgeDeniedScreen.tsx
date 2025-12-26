import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgeDeniedScreenProps {
  onBack?: () => void;
}

const AgeDeniedScreen: React.FC<AgeDeniedScreenProps> = ({ onBack }) => {
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
        <p className="text-muted-foreground max-w-md mb-6">
          {t('ageDeniedMessage')}
        </p>
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="border-flame-orange/50 text-foreground hover:bg-flame-orange/10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AgeDeniedScreen;
