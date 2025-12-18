import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Flame, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-flame-gradient flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold flame-text">
                Flame Beverage
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your premium destination for the finest spirits and beverages. Quality guaranteed.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary-text transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary-text transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary-text transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-ternary-text mb-4">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary-text transition-colors"
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-muted-foreground hover:text-primary-text transition-colors"
                >
                  {t('allProducts')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#categories"
                  className="text-sm text-muted-foreground hover:text-primary-text transition-colors"
                >
                  {t('categories')}
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  className="text-sm text-muted-foreground hover:text-primary-text transition-colors"
                >
                  {t('offers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-ternary-text mb-4">
              {language === 'en' ? 'Legal' : 'कानूनी'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary-text transition-colors"
                >
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary-text transition-colors"
                >
                  {t('termsConditions')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary-text transition-colors"
                >
                  {t('privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              {t('customerService')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary-text" />
                <span>+977 9800000000</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary-text" />
                <span>info@flamebeverage.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary-text shrink-0 mt-0.5" />
                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              {t('newsletter')}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for exclusive offers and updates.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-secondary/50 border-border/50"
              />
              <Button className="bg-primary-btn hover:bg-primary-hover text-primary-foreground shrink-0">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t('copyright')}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-primary-text">🔞</span>
            <span>{t('drinkResponsibly')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
