import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Flame, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  return (
    <footer className={`border-t transition-colors ${
      theme === 'dark'
        ? 'bg-card border-border'
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-flame-gradient flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className={`text-xl font-display font-bold ${
                theme === 'dark'
                  ? 'flame-text'
                  : 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
              }`}>
                Flame Beverage
              </span>
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              Your premium destination for the finest spirits and beverages. Quality guaranteed.
            </p>
            <div className="flex gap-4">
              <a href="#" className={`transition-colors ${
                theme === 'dark'
                  ? 'text-muted-foreground hover:text-primary-text'
                  : 'text-gray-500 hover:text-orange-600'
              }`}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className={`transition-colors ${
                theme === 'dark'
                  ? 'text-muted-foreground hover:text-primary-text'
                  : 'text-gray-500 hover:text-orange-600'
              }`}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className={`transition-colors ${
                theme === 'dark'
                  ? 'text-muted-foreground hover:text-primary-text'
                  : 'text-gray-500 hover:text-orange-600'
              }`}>
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-display font-semibold mb-4 ${
              theme === 'dark' ? 'text-ternary-text' : 'text-gray-900'
            }`}>
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className={`text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-muted-foreground hover:text-primary-text'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className={`text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-muted-foreground hover:text-primary-text'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  {t('allProducts')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#categories"
                  className={`text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-muted-foreground hover:text-primary-text'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  {t('categories')}
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  className={`text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-muted-foreground hover:text-primary-text'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  {t('offers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className={`font-display font-semibold mb-4 ${
              theme === 'dark' ? 'text-ternary-text' : 'text-gray-900'
            }`}>
              {language === 'en' ? 'Legal' : 'कानूनी'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className={`text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-muted-foreground hover:text-primary-text'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className={`text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-muted-foreground hover:text-primary-text'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  {t('termsConditions')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className={`text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-muted-foreground hover:text-primary-text'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  {t('privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`font-display font-semibold mb-4 ${
              theme === 'dark' ? 'text-foreground' : 'text-gray-900'
            }`}>
              {t('customerService')}
            </h4>
            <ul className="space-y-3">
              <li className={`flex items-center gap-2 text-sm ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                <Phone className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-primary-text' : 'text-orange-600'
                }`} />
                <span>+977 9800000000</span>
              </li>
              <li className={`flex items-center gap-2 text-sm ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                <Mail className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-primary-text' : 'text-orange-600'
                }`} />
                <span>info@flamebeverage.com</span>
              </li>
              <li className={`flex items-start gap-2 text-sm ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${
                  theme === 'dark' ? 'text-primary-text' : 'text-orange-600'
                }`} />
                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className={`font-display font-semibold mb-4 ${
              theme === 'dark' ? 'text-foreground' : 'text-gray-900'
            }`}>
              {t('newsletter')}
            </h4>
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              Subscribe for exclusive offers and updates.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className={`flex-1 ${theme === 'dark'
                  ? 'bg-secondary/50 border-border/50'
                  : 'bg-gray-50 border-gray-200 focus:border-orange-400'
                }`}
              />
              <Button className="bg-primary-btn hover:bg-primary-hover text-primary-foreground shrink-0">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={`mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 transition-colors ${
          theme === 'dark' ? 'border-border' : 'border-gray-200'
        }`}>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
          }`}>
            {t('copyright')}
          </p>
          <div className={`flex items-center gap-2 text-sm ${
            theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
          }`}>
            <span className={theme === 'dark' ? 'text-primary-text' : 'text-orange-600'}>🔞</span>
            <span>{t('drinkResponsibly')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
