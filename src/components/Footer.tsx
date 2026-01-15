import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Flame, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Loader2, CheckCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      setIsSubmitting(true);
      
      // Initialize EmailJS (you'll need to set these in your .env.local)
      // NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
      // NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
      // NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
      
      // const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
      //   const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
      //   const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';
      const serviceId = 'service_3hnx9qr';
      const templateId = 'template_uw796lo';
      const publicKey = '5qzm3CpcCNMoXN2Y0';

      if (!serviceId || !templateId || !publicKey) {
        console.warn('EmailJS credentials not configured. Please set NEXT_PUBLIC_EMAILJS_* environment variables.');
        toast.error('Newsletter subscription is not configured. Please contact support.');
        return;
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          // Standard EmailJS variable names
          email: 'hasinadhungel11@gmail.com',
          to_name: 'Flame Beverage Admin',
          from_name: 'Flame Beverage Website',
          from_email: newsletterEmail,
          subject: 'New Newsletter Subscription',
          message: `New newsletter subscription from: ${newsletterEmail}`,
          reply_to: newsletterEmail,
        },
        publicKey
      );

      setIsSubmitted(true);
      toast.success(language === 'en' 
        ? 'Successfully subscribed to newsletter!' 
        : 'न्युजलेटरको लागि सदस्यता लिइयो!');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setNewsletterEmail("");
        setIsSubmitted(false);
      }, 3000);
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast.error(language === 'en' 
        ? 'Failed to subscribe. Please try again.' 
        : 'सदस्यता असफल भयो। कृपया पुनः प्रयास गर्नुहोस्।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className={`border-t transition-colors ${
      theme === 'dark'
        ? 'bg-card border-border'
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4 col-span-2 md:col-span-1">
        <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/assets/flameMainLogo.png"
                alt="Flame Beverage logo"
                width={180}
                height={48}
                className="object-contain h-10 sm:h-12 w-auto"
                priority
              />
          </div>


            {/* <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-flame-gradient flex items-center justify-center">
                <Image
                  src="/assets/flamelogo.png"
                  alt="Flame logo"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className={`text-xl font-display font-bold ${
                theme === 'dark'
                  ? 'flame-text'
                  : 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
              }`}>
                Flame Beverage
              </span>
            </div> */}
            <p className={`text-xs sm:text-sm ${
              theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              Your premium destination for the finest spirits and beverages. Quality guaranteed.
            </p>
            <div className="flex gap-3 sm:gap-4">
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
            <h4 className={`font-display font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${
              theme === 'dark' ? 'text-ternary-text' : 'text-gray-900'
            }`}>
              {t('quickLinks')}
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/"
                  className={`text-xs sm:text-sm underline transition-colors ${
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
                  className={`text-xs sm:text-sm underline transition-colors ${
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
                  className={`text-xs sm:text-sm underline transition-colors ${
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
                  className={`text-xs sm:text-sm underline transition-colors ${
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
            <h4 className={`font-display font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${
              theme === 'dark' ? 'text-ternary-text' : 'text-gray-900'
            }`}>
              {language === 'en' ? 'Legal' : 'कानूनी'}
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/about"
                  className={`text-xs sm:text-sm underline transition-colors ${
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
                  className={`text-xs sm:text-sm underline transition-colors ${
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
                  className={`text-xs sm:text-sm underline transition-colors ${
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
            <h4 className={`font-display font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${
              theme === 'dark' ? 'text-foreground' : 'text-gray-900'
            }`}>
              {t('customerService')}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                <Phone className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                  theme === 'dark' ? 'text-primary-text' : 'text-orange-600'
                }`} />
                <a href="tel:+9779800000000" className="break-all hover:text-flame-orange transition-colors">
                  +977 9800000000
                </a>
              </li>
              <li className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                <Mail className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                  theme === 'dark' ? 'text-primary-text' : 'text-orange-600'
                }`} />
                <a href="mailto:info@flamebeverage.com" className="break-all hover:text-flame-orange transition-colors">
                  info@flamebeverage.com
                </a>
              </li>
              <li className={`flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5 ${
                  theme === 'dark' ? 'text-primary-text' : 'text-orange-600'
                }`} />
                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className={`font-display font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${
              theme === 'dark' ? 'text-foreground' : 'text-gray-900'
            }`}>
              {t('newsletter')}
            </h4>
            <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
              theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              Subscribe for exclusive offers and updates.
            </p>
            <form 
              onSubmit={handleNewsletterSubmit}
              className="flex gap-2"
            >
              <Input
                type="email"
                placeholder="Your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                disabled={isSubmitting || isSubmitted}
                className={`flex-1 ${theme === 'dark'
                  ? 'bg-secondary/50 border-border/50'
                  : 'bg-gray-50 border-gray-200 focus:border-orange-400'
                }`}
              />
              <Button 
                type="submit"
                disabled={isSubmitting || isSubmitted || !newsletterEmail}
                className="bg-primary-btn hover:bg-primary-hover text-primary-foreground shrink-0 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSubmitted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className={`mt-8 sm:mt-12 pt-6 sm:pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 transition-colors ${
          theme === 'dark' ? 'border-border' : 'border-gray-200'
        }`}>
          <p className={`text-xs sm:text-sm text-center md:text-left ${
            theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
          }`}>
            {t('copyright')}
          </p>
          <div className={`flex items-center gap-2 text-xs sm:text-sm ${
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
