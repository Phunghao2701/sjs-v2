/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\FooterCTA.jsx
 */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/button';
import Icon from '../../../shared/components/Icon';

export default function FooterCTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate('/login');
  };

  return (
    <section 
      id="footer-cta" 
      className="py-12 relative overflow-hidden text-center"
      style={{
        backgroundColor: 'var(--bg-main)',
        borderTop: '1px solid var(--border)'
      }}
    >
      {/* Background Spotlight glow effect */}
      <div 
        className="absolute pointer-events-none"
        style={{
          bottom: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '300px',
          background: 'radial-gradient(circle, var(--primary-light) 0%, rgba(199, 238, 255, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }}
      />
      
      <div className="container mx-auto px-4 py-12 relative z-10 reveal-scale">
        
        {/* Main Heading */}
        <h2 
          className="font-display text-main mb-3" 
          style={{ fontWeight: 800, fontSize: 'calc(1.5rem + 1.8vw)', letterSpacing: '-0.02em', lineHeight: 1.2 }}
        >
          {t('ctaHeading')}
        </h2>
        
        {/* Sub Heading */}
        <p 
          className="text-muted-custom mx-auto mb-8 leading-relaxed"
          style={{ fontSize: 'calc(0.9rem + 0.1vw)', maxWidth: '600px', lineHeight: 1.6 }}
        >
          {t('ctaSubheading')}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full sm:w-auto">
          {/* Try Searching Now Button */}
          <a
            href="#search-sandbox"
            className="btn-view-trends w-full sm:w-auto rounded-pill px-5 py-3 flex items-center justify-center gap-2 border border-border text-foreground hover:bg-muted/50 transition-colors"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            <Icon icon="lucide:search" className="btn-view-trends-icon text-lg" />
            <span>{t('ctaTryNowBtn')}</span>
          </a>

          {/* Create Free Account Button */}
          <Button
            onClick={handleCreateAccount}
            className="btn-primary-glow w-full sm:w-auto rounded-pill px-5 py-3 flex items-center justify-center gap-2 border-0 h-auto"
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            <Icon icon="lucide:user-plus" className="text-lg" />
            <span>{t('ctaCreateAccountBtn')}</span>
          </Button>
        </div>

      </div>
    </section>
  );
}
