/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Footer.jsx
 */
import { useTranslation } from 'react-i18next';
import Logo from '../../../shared/components/Logo';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const links = [
    { labelKey: 'footerAbout', href: '#' },
    { labelKey: 'footerTerms', href: '#' },
    { labelKey: 'footerPrivacy', href: '#' },
    { labelKey: 'footerContact', href: '#' },
  ];

  return (
    <footer 
      className="py-8 bg-surface border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand and Description */}
          <div className="flex items-center gap-3">
            <div>
              <Logo size={40} fontSize="1.25rem" />
              <div className="text-muted-foreground text-xs max-w-[300px] mt-1">
                {t('footerDesc')}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {links.map((link) => (
              <a
                key={link.labelKey}
                href={link.href}
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div 
          className="text-center text-muted-foreground mt-8 pt-6 border-t border-border text-xs"
        >
          © {currentYear} Trending System. {t('footerRights')}
        </div>
      </div>
    </footer>
  );
}
