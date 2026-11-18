/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Footer.jsx
 */
import { useTranslation } from 'react-i18next';
import Container from 'react-bootstrap/Container';
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
      className="py-4"
      style={{
        backgroundColor: 'var(--bg-section)',
        borderTop: '1px solid var(--border)'
      }}
    >
      <Container>
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
          {/* Brand and Description */}
          <div className="d-flex align-items-center gap-3">
            <div>
              <Logo size={40} fontSize="1.25rem" />
              <div className="text-muted-custom" style={{ fontSize: '13px', maxWidth: '300px' }}>
                {t('footerDesc')}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="d-flex flex-wrap justify-content-center gap-4">
            {links.map((link) => (
              <a
                key={link.labelKey}
                href={link.href}
                className="text-muted-custom text-decoration-none"
                style={{ fontSize: '14px', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div 
          className="text-center text-muted-custom mt-4 pt-4" 
          style={{ borderTop: '1px solid var(--border)', fontSize: '13px' }}
        >
          © {currentYear} Trending System. {t('footerRights')}
        </div>
      </Container>
    </footer>
  );
}
