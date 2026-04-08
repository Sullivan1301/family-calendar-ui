import { EventStatus, UserStatus } from '../../types';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: EventStatus | UserStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-tba-yellow text-tba-text font-medium';
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-700 font-medium';
      case 'rejected':
        return 'bg-tba-red/10 text-tba-red font-medium';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'active': return 'Actif';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs transition-all animate-fade-in",
      getStatusStyles(status),
      className
    )}>
      {getStatusLabel(status)}
    </span>
  );
}
