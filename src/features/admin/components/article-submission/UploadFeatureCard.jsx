import { Card } from '../../../../shared/ui/card';
import Icon from '../../../../shared/components/Icon';

/**
 * UploadFeatureCard Component
 * Displays a feature highlight badge card used below upload file zone.
 */
export default function UploadFeatureCard({ title, description, icon }) {
  return (
    <Card className="p-3 border border-border rounded-xl bg-surface h-full shadow-2xs">
      <div className="flex flex-col gap-2">
        <div 
          className="size-8 rounded-full flex items-center justify-center bg-primary-subtle text-primary shrink-0"
        >
          <Icon icon={icon} width="16" />
        </div>

        <div>
          <h6 className="font-bold text-foreground mb-1 text-sm">{title}</h6>
          <p className="text-muted-foreground text-xs leading-relaxed mb-0">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
