import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, Package, Truck, Gift } from 'lucide-react';

const PromoBanner: React.FC = () => {
  const { t } = useLanguage();

  const promos = [
    {
      icon: Clock,
      title: t('hourDelivery'),
      color: 'from-flame-red to-flame-orange',
    },
    {
      icon: Package,
      title: t('bulkDiscount'),
      color: 'from-flame-orange to-flame-yellow',
    },
    {
      icon: Truck,
      title: t('freeDelivery'),
      color: 'from-flame-yellow to-flame-gold',
    },
    {
      icon: Gift,
      title: t('eventOffer'),
      color: 'from-flame-gold to-flame-orange',
    },
  ];

  return (
    <section className="py-8 overflow-hidden bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {promos.map((promo, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 card-glow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${promo.color} flex items-center justify-center shrink-0`}>
                <promo.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">{promo.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
