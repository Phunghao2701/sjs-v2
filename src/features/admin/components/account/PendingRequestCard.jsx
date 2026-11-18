import { Card } from '../../../../shared/ui/card';
import PrimaryButton from '../../../../shared/components/Button/PrimaryButton';

/**
 * PendingRequestCard Component
 * Displays a single authorization upgrade or role request.
 */
export default function PendingRequestCard({ request, onApprove, onDecline }) {
  const { id, name, roleRequested, institution } = request;
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card 
      className="p-3 mb-3 border border-border rounded-xl bg-surface shadow-2xs"
    >
      {/* Card Header section: Initials Avatar + Info metadata */}
      <div className="flex items-center gap-3 mb-2.5">
        <div 
          className="size-10 rounded-full flex items-center justify-center font-bold shrink-0 bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 text-sm"
        >
          {initials}
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-foreground truncate text-sm">{name}</div>
          <div className="text-muted-foreground truncate text-xs">{institution}</div>
        </div>
      </div>

      {/* Description payload */}
      <p className="text-muted-foreground text-xs mb-3 leading-relaxed">
        Requesting <strong className="text-foreground">{roleRequested}</strong> role for the Platform.
      </p>

      {/* Action buttons */}
      <div className="flex gap-2">
        <PrimaryButton
          onClick={() => onApprove(id)}
          className="flex-1 py-1.5 text-xs h-8"
        >
          Approve
        </PrimaryButton>
        <PrimaryButton
          onClick={() => onDecline(id)}
          variant="outline"
          className="flex-1 py-1.5 text-xs h-8"
        >
          Decline
        </PrimaryButton>
      </div>
    </Card>
  );
}
