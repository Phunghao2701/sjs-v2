/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Hero.jsx
 */
import { useTranslation } from 'react-i18next';
import Icon from '../../../shared/components/Icon';

export default function Hero() {
  const { t } = useTranslation();

  const stats = [
    { valueKey: 'papersValue', labelKey: 'papersLabel', color: '#000000' },
    { valueKey: 'periodValue', labelKey: 'periodLabel', color: '#000000' },
    { valueKey: 'keywordsValue', labelKey: 'keywordsLabel', color: '#000000' },
    { valueKey: 'freeValue', labelKey: 'freeLabel', color: '#AB7E55' },
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-16 pb-6 overflow-hidden grid-bg">
      {/* Radial overlay to fade out the grid pattern */}
      <div className="absolute inset-0 radial-fade pointer-events-none" />

      {/* Hero content container */}
      <div className="container mx-auto px-4 relative flex flex-col justify-center items-center text-center flex-grow z-10 pt-10">
        
        {/* Animated OpenAlex Badge */}
        <div 
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full mb-4 reveal-on-scroll delay-100"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            color: '#000000',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.05em'
          }}
        >
          <Icon icon="lucide:sparkles" className="text-warning animate-pulse" />
          <span>{t('badgeText')}</span>
        </div>

        {/* Main Heading */}
        <h1 
          className="font-display text-main mb-4 reveal-on-scroll delay-200"
          style={{
            fontWeight: 800,
            fontSize: 'calc(1.8rem + 2.5vw)',
            lineHeight: 1.15,
            maxWidth: '900px',
            letterSpacing: '-0.02em'
          }}
        >
          {t('headingPrefix')}{' '}
          <span className="glow-gradient-text glow-text-cyan font-display">
            {t('headingHighlight')}
          </span>
        </h1>

        {/* Sub Heading */}
        <p 
          className="text-main mb-8 max-w-2xl reveal-on-scroll delay-300 mx-auto"
          style={{
            fontSize: 'calc(0.95rem + 0.15vw)',
            lineHeight: 1.6,
            maxWidth: '650px'
          }}
        >
          {t('subheading')}
        </p>

        {/* Action CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full sm:w-auto mb-10 reveal-on-scroll delay-400">
          {/* Start Searching Button */}
          <a
            href="#search-sandbox"
            className="btn-primary-glow rounded-pill px-5 py-3 flex items-center justify-center gap-2 w-full sm:w-auto text-white"
            style={{ fontSize: '14px', letterSpacing: '0.03em', fontWeight: 600 }}
          >
            <Icon icon="lucide:rocket" className="text-lg" />
            <span>{t('ctaSearch')}</span>
          </a>

          {/* View Trends Button */}
          <a
            href="#features"
            className="btn-view-trends rounded-pill px-5 py-3 flex items-center justify-center gap-2 w-full sm:w-auto border border-border text-foreground hover:bg-muted/50 transition-colors"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            <Icon icon="lucide:bar-chart-2" className="text-lg btn-view-trends-icon" />
            <span>{t('ctaTrends')}</span>
          </a>
        </div>
      </div>

      {/* Stats Counter Row Container */}
      <div className="relative w-full z-10 reveal-scale delay-500" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container mx-auto px-4 pt-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div 
                key={idx}
                className={idx > 0 ? 'md:border-l md:border-black/10' : ''}
              >
                <div className="flex flex-col items-center justify-center">
                  {/* Stat Value */}
                  <span 
                    className="font-display mb-1"
                    style={{
                      fontWeight: 800,
                      fontSize: 'calc(1.3rem + 1vw)',
                      color: stat.color,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {t(stat.valueKey)}
                  </span>
                  {/* Stat Label */}
                  <span 
                    className="text-muted-custom font-bold"
                    style={{
                      fontSize: '13px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {t(stat.labelKey)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
