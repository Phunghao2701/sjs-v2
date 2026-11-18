/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Features.jsx
 */
import { useTranslation } from 'react-i18next';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/ui/card';

/**
 * Reusable Feature Card Component
 */
function FeatureCard({ icon, title, description }) {
  return (
    <Card 
      className="glass-card rounded-2xl p-6 h-full text-left relative overflow-hidden bg-surface border border-border transition-colors shadow-2xs"
    >
      {/* Icon Wrapper */}
      <div 
        className="flex items-center justify-center mb-4 size-12 rounded-xl bg-primary-subtle border border-border text-primary"
      >
        <Icon icon={icon} className="text-xl" />
      </div>

      {/* Card Content */}
      <h3 className="font-display font-bold text-foreground mb-2 text-base">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-0 text-sm">
        {description}
      </p>
    </Card>
  );
}

export default function Features() {
  const { t } = useTranslation();

  const featureList = [
    {
      icon: 'lucide:search',
      color: 'text-cyan-400',
      titleKey: 'feature1Title',
      descKey: 'feature1Desc',
    },
    {
      icon: 'lucide:trending-up',
      color: 'text-blue-400',
      titleKey: 'feature2Title',
      descKey: 'feature2Desc',
    },
    {
      icon: 'lucide:bell',
      color: 'text-amber-400',
      titleKey: 'feature3Title',
      descKey: 'feature3Desc',
    },
    {
      icon: 'lucide:folder',
      color: 'text-emerald-400',
      titleKey: 'feature4Title',
      descKey: 'feature4Desc',
    },
    {
      icon: 'lucide:file-text',
      color: 'text-indigo-400',
      titleKey: 'feature5Title',
      descKey: 'feature5Desc',
    },
    {
      icon: 'lucide:gift',
      color: 'text-purple-400',
      titleKey: 'feature6Title',
      descKey: 'feature6Desc',
    },
  ];

  return (
    <section 
      id="features" 
      className="py-16 relative bg-surface border-y border-border overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-2 text-xs font-bold tracking-wider uppercase text-primary">
            <span className="w-6 h-px bg-primary" />
            <span>{t('featuresSubtitle')}</span>
          </div>
          <h2 className="font-display font-extrabold text-foreground text-2xl sm:text-3xl md:text-4xl tracking-tight mb-3">
            {t('featuresTitle')}
          </h2>
          <p className="text-muted-foreground text-base mx-auto mb-0 max-w-xl">
            {t('featuresDesc')}
          </p>
        </div>

        {/* Grid of Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((feature, index) => (
            <div key={index}>
              <FeatureCard
                icon={feature.icon}
                title={t(feature.titleKey)}
                description={t(feature.descKey)}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
